package com.smartcampus.backend.booking.service;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.model.BookingSuggestion;
import com.smartcampus.backend.booking.repository.BookingRepository;
import com.smartcampus.backend.notification.model.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.model.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public BookingService(BookingRepository repository,
                          NotificationService notificationService,
                          MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }

    private Resource findResourceWithoutImages(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        query.fields().exclude("imageBase64").exclude("imageType");
        return mongoTemplate.findOne(query, Resource.class);
    }

    public Booking createBooking(Booking booking) {

        Resource resource = findResourceWithoutImages(booking.getResourceId());
        if (resource == null) {
            throw new RuntimeException("Resource not found");
        }

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available for booking");
        }

        LocalTime newStart = LocalTime.parse(booking.getStartTime());
        LocalTime newEnd = LocalTime.parse(booking.getEndTime());

        if (!newEnd.isAfter(newStart)) {
            throw new RuntimeException("End time must be after start time");
        }

        List<Booking> existingBookings = repository.findByResourceIdAndDate(
                booking.getResourceId(),
                booking.getDate()
        );

        for (Booking existingBooking : existingBookings) {
            if ("REJECTED".equals(existingBooking.getStatus()) || "CANCELLED".equals(existingBooking.getStatus())) {
                continue;
            }

            LocalTime existingStart = LocalTime.parse(existingBooking.getStartTime());
            LocalTime existingEnd = LocalTime.parse(existingBooking.getEndTime());

            boolean overlaps = newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);

            if (overlaps) {
                throw new RuntimeException("Booking conflict: resource is already booked for the selected time");
            }
        }

        booking.setStatus("PENDING");
        booking.setReviewReason(null);
        booking.setApprovedBy(null);

        return repository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return repository.findAll();
    }

    public Booking getBookingById(String id) {
        return repository.findById(id).orElse(null);
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    public List<Booking> getBookingsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Booking> getBookingsByResourceId(String resourceId) {
        return repository.findByResourceId(resourceId);
    }

    public List<Booking> getBookingsByDate(String date) {
        return repository.findByDate(date);
    }

    public Booking updateBookingStatus(String id, String status, String reason, String admin) {
        Booking existingBooking = repository.findById(id).orElse(null);

        if (existingBooking == null) {
            throw new RuntimeException("Booking not found");
        }

        existingBooking.setStatus(status);
        existingBooking.setReviewReason(reason);
        existingBooking.setApprovedBy(admin);

        Booking savedBooking = repository.save(existingBooking);

        if ("APPROVED".equals(status)) {
            notificationService.createNotificationForUser(
                    savedBooking.getUserId(),
                    NotificationType.BOOKING_APPROVED,
                    "Booking Approved",
                    "Your booking has been approved.",
                    savedBooking.getId()
            );
        }

        if ("REJECTED".equals(status)) {
            notificationService.createNotificationForUser(
                    savedBooking.getUserId(),
                    NotificationType.BOOKING_REJECTED,
                    "Booking Rejected",
                    "Your booking was rejected. Reason: " + reason,
                    savedBooking.getId()
            );
        }

        return savedBooking;
    }

    public void deleteBooking(String id) {
        repository.deleteById(id);
    }

    public BookingSuggestion getSuggestedSlot(String resourceId, String date, String startTime, String endTime) {

        LocalTime requestedStart = LocalTime.parse(startTime);
        LocalTime requestedEnd = LocalTime.parse(endTime);

        if (!requestedEnd.isAfter(requestedStart)) {
            throw new RuntimeException("End time must be after start time");
        }

        long durationMinutes = java.time.Duration.between(requestedStart, requestedEnd).toMinutes();

        List<Booking> bookings = repository.findByResourceIdAndDateOrderByStartTimeAsc(resourceId, date);

        bookings = bookings.stream()
                .filter(b -> !"REJECTED".equals(b.getStatus()) && !"CANCELLED".equals(b.getStatus()))
                .toList();

        LocalTime candidateStart = requestedStart;

        for (Booking booking : bookings) {
            LocalTime existingStart = LocalTime.parse(booking.getStartTime());
            LocalTime existingEnd = LocalTime.parse(booking.getEndTime());

            LocalTime candidateEnd = candidateStart.plusMinutes(durationMinutes);

            boolean overlaps = candidateStart.isBefore(existingEnd) && candidateEnd.isAfter(existingStart);

            if (overlaps) {
                candidateStart = existingEnd;
            }
        }

        LocalTime suggestedEnd = candidateStart.plusMinutes(durationMinutes);

        return new BookingSuggestion(
                candidateStart.toString(),
                suggestedEnd.toString(),
                "Suggested next available slot"
        );
    }
}