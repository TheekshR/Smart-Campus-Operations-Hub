package com.smartcampus.backend.chatbot;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.model.BookingSuggestion;
import com.smartcampus.backend.booking.service.BookingService;
import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.repository.IssueRepository;
import com.smartcampus.backend.resource.dto.ResourceSummaryDTO;
import com.smartcampus.backend.resource.service.ResourceService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CampusTools {

    private final BookingService bookingService;
    private final IssueRepository issueRepository;
    private final ResourceService resourceService;

    public CampusTools(BookingService bookingService,
                       IssueRepository issueRepository,
                       ResourceService resourceService) {
        this.bookingService = bookingService;
        this.issueRepository = issueRepository;
        this.resourceService = resourceService;
    }

    public String getUserContext(String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        long activeBookings = bookings.stream()
                .filter(b -> "APPROVED".equals(b.getStatus()) || "PENDING".equals(b.getStatus()))
                .count();

        List<Issue> issues = issueRepository.findByUserId(userId);
        long openTickets = issues.stream()
                .filter(i -> !"FIXED".equals(i.getStatus()))
                .count();

        long totalResources = resourceService.countResources();

        return String.format(
                "- Active bookings: %d\n- Open tickets: %d\n- Total campus resources: %d",
                activeBookings, openTickets, totalResources
        );
    }

    // ===== TOOL: List available resources =====
    public String listResources() {
        List<ResourceSummaryDTO> resources = resourceService.getAllResourceSummaries();
        if (resources.isEmpty()) {
            return "No resources found in the system.";
        }
        StringBuilder sb = new StringBuilder();
        for (ResourceSummaryDTO r : resources) {
            sb.append(String.format("- **%s** (ID: %s) | Type: %s | Capacity: %d | Location: %s | Status: %s | Available: %s - %s\n",
                    r.getName(), r.getId(), r.getType(), r.getCapacity(), r.getLocation(), r.getStatus(),
                    r.getAvailabilityStart() != null ? r.getAvailabilityStart() : "N/A",
                    r.getAvailabilityEnd() != null ? r.getAvailabilityEnd() : "N/A"));
        }
        return sb.toString();
    }

    // ===== TOOL: Search resource by name =====
    public String searchResourceByName(String name) {
        List<ResourceSummaryDTO> resources = resourceService.getAllResourceSummaries();
        List<ResourceSummaryDTO> matched = resources.stream()
                .filter(r -> r.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());
        if (matched.isEmpty()) {
            return "No resource found matching '" + name + "'. Use list_resources to see all available resources.";
        }
        StringBuilder sb = new StringBuilder();
        for (ResourceSummaryDTO r : matched) {
            sb.append(String.format("- **%s** (ID: %s) | Type: %s | Capacity: %d | Location: %s | Status: %s\n",
                    r.getName(), r.getId(), r.getType(), r.getCapacity(), r.getLocation(), r.getStatus()));
        }
        return sb.toString();
    }

    // ===== TOOL: Create a booking =====
    public String createBooking(String resourceId, String userId, String date,
                                String startTime, String endTime, String purpose, int attendees) {
        try {
            Booking booking = new Booking();
            booking.setResourceId(resourceId);
            booking.setUserId(userId);
            booking.setDate(date);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setPurpose(purpose);
            booking.setAttendees(attendees);

            Booking saved = bookingService.createBooking(booking);
            return String.format("Booking created successfully! Booking ID: %s | Resource: %s | Date: %s | Time: %s - %s | Status: %s",
                    saved.getId(), saved.getResourceId(), saved.getDate(),
                    saved.getStartTime(), saved.getEndTime(), saved.getStatus());
        } catch (RuntimeException e) {
            return "Booking failed: " + e.getMessage();
        }
    }

    // ===== TOOL: Get user's bookings =====
    public String getUserBookings(String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        if (bookings.isEmpty()) {
            return "No bookings found for this user.";
        }
        StringBuilder sb = new StringBuilder();
        for (Booking b : bookings) {
            sb.append(String.format("- Booking %s | Resource: %s | Date: %s | Time: %s - %s | Status: %s | Purpose: %s\n",
                    b.getId(), b.getResourceId(), b.getDate(),
                    b.getStartTime(), b.getEndTime(), b.getStatus(), b.getPurpose()));
        }
        return sb.toString();
    }

    // ===== TOOL: Cancel a booking =====
    public String cancelBooking(String bookingId) {
        try {
            Booking cancelled = bookingService.updateBookingStatus(bookingId, "CANCELLED", "Cancelled via assistant", "ASSISTANT");
            return "Booking " + cancelled.getId() + " has been cancelled successfully.";
        } catch (RuntimeException e) {
            return "Failed to cancel booking: " + e.getMessage();
        }
    }

    // ===== TOOL: Get booking suggestions =====
    public String getBookingSuggestion(String resourceId, String date, String startTime, String endTime) {
        try {
            BookingSuggestion suggestion = bookingService.getSuggestedSlot(resourceId, date, startTime, endTime);
            return String.format("Suggestion: %s | Available slot: %s - %s",
                    suggestion.getMessage(), suggestion.getSuggestedStartTime(), suggestion.getSuggestedEndTime());
        } catch (RuntimeException e) {
            return "Could not get suggestion: " + e.getMessage();
        }
    }

    // ===== TOOL: Get user's issues/tickets =====
    public String getUserIssues(String userId) {
        List<Issue> issues = issueRepository.findByUserId(userId);
        if (issues.isEmpty()) {
            return "No reported issues found for this user.";
        }
        StringBuilder sb = new StringBuilder();
        for (Issue i : issues) {
            sb.append(String.format("- Issue %s | Resource: %s | Priority: %s | Status: %s | Description: %s\n",
                    i.getId(), i.getResourceId(), i.getPriority(), i.getStatus(), i.getDescription()));
        }
        return sb.toString();
    }
}
