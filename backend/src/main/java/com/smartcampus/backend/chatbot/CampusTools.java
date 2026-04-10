package com.smartcampus.backend.chatbot;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.repository.BookingRepository;
import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.repository.IssueRepository;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CampusTools {

    private final BookingRepository bookingRepository;
    private final IssueRepository issueRepository;
    private final ResourceRepository resourceRepository;

    public CampusTools(BookingRepository bookingRepository,
                       IssueRepository issueRepository,
                       ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.issueRepository = issueRepository;
        this.resourceRepository = resourceRepository;
    }

    public String getUserContext(String userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        long activeBookings = bookings.stream()
                .filter(b -> "APPROVED".equals(b.getStatus()) || "PENDING".equals(b.getStatus()))
                .count();

        List<Issue> issues = issueRepository.findByUserId(userId);
        long openTickets = issues.stream()
                .filter(i -> !"FIXED".equals(i.getStatus()))
                .count();

        long totalResources = resourceRepository.count();

        return String.format(
                "- Active bookings: %d\n- Open tickets: %d\n- Total campus resources: %d",
                activeBookings, openTickets, totalResources
        );
    }
}
