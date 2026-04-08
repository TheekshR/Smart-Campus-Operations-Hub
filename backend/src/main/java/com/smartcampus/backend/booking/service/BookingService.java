package com.smartcampus.backend.booking.service;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.repository.BookingRepository;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository repository, ResourceRepository resourceRepository) {
        this.repository = repository;
        this.resourceRepository = resourceRepository;
    }

    public Booking createBooking(Booking booking) {

        // 1. Validate resource exists
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        if (resource == null) {
            throw new RuntimeException("Resource not found");
        }

        // 2. Validate resource is active
        if (!"ACTIVE".equals(resource.getStatus())) {
            throw new RuntimeException("Resource is not available for booking");
        }

        // 3. Validate required fields
        if (booking.getResourceId() == null || booking.getResourceId().isBlank()) {
            throw new RuntimeException("Resource ID is required");
        }
        if (booking.getUserId() == null || booking.getUserId().isBlank()) {
            throw new RuntimeException("User ID is required");
        }
        if (booking.getDate() == null || booking.getDate().isBlank()) {
            throw new RuntimeException("Date is required");
        }
        if (booking.getStartTime() == null || booking.getStartTime().isBlank()) {
            throw new RuntimeException("Start time is required");
        }
        if (booking.getEndTime() == null || booking.getEndTime().isBlank()) {
            throw new RuntimeException("End time is required");
        }
        if (booking.getPurpose() == null || booking.getPurpose().isBlank()) {
            throw new RuntimeException("Purpose is required");
        }
        if (booking.getAttendees() <= 0) {
            throw new RuntimeException("Attendees must be greater than 0");
        }

        // 4. Validate time order
        LocalTime newStart = LocalTime.parse(booking.getStartTime());
        LocalTime newEnd = LocalTime.parse(booking.getEndTime());

        if (!newEnd.isAfter(newStart)) {
            throw new RuntimeException("End time must be after start time");
        }

        // 5. Conflict checking
        List<Booking> existingBookings = repository.findByResourceIdAndDate(
                booking.getResourceId(),
                booking.getDate()
        );

        for (Booking existingBooking : existingBookings) {

            // Ignore rejected/cancelled bookings
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

        // 6. Save with default status
        booking.setStatus("PENDING");
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

    public Booking updateBookingStatus(String id, String status, String reason, String admin) {
        Booking existingBooking = repository.findById(id).orElse(null);
    
        if (existingBooking == null) {
            throw new RuntimeException("Booking not found");
        }
    
        existingBooking.setStatus(status);
        existingBooking.setReviewReason(reason);
        existingBooking.setApprovedBy(admin);
    
        return repository.save(existingBooking);
    }

    public void deleteBooking(String id) {
        repository.deleteById(id);
    }
}