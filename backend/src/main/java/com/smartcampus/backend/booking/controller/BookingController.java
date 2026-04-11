package com.smartcampus.backend.booking.controller;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.model.BookingSuggestion;
import com.smartcampus.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Allow requests from React frontend (running on port 3000)
@CrossOrigin(origins = "http://localhost:3000")

// Marks this class as a REST controller
@RestController

// Base URL for all booking-related APIs
@RequestMapping("/api/bookings")
public class BookingController {

    // Service layer for handling booking logic
    private final BookingService service;

    // Constructor injection
    public BookingController(BookingService service) {
        this.service = service;
    }

    // ================= CREATE BOOKING =================

    // USER and ADMIN can create a booking
    @PreAuthorize("hasAnyRole('USER','ADMIN')")

    // POST request to create a new booking
    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking) {
        // Save booking using service layer
        return service.createBooking(booking);
    }

    // ================= GET ALL BOOKINGS =================

    // Only ADMIN can view all bookings
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    // ================= GET BOOKING BY ID =================

    // USER and ADMIN can view a specific booking
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getBookingById(id);
    }

    // ================= GET BOOKINGS BY USER =================

    // USER and ADMIN can view bookings of a specific user
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable String userId) {
        return service.getBookingsByUserId(userId);
    }

    // ================= GET BOOKINGS BY STATUS =================

    // Only ADMIN can filter bookings by status
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public List<Booking> getByStatus(@PathVariable String status) {
        return service.getBookingsByStatus(status);
    }

    // ================= GET BOOKINGS BY RESOURCE =================

    // Only ADMIN can view bookings for a specific resource
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResourceId(@PathVariable String resourceId) {
        return service.getBookingsByResourceId(resourceId);
    }

    // ================= GET BOOKINGS BY DATE =================

    // Only ADMIN can filter bookings by date
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/date/{date}")
    public List<Booking> getByDate(@PathVariable String date) {
        return service.getBookingsByDate(date);
    }

    // ================= GET SUGGESTED TIME SLOT =================

    // USER and ADMIN can request suggestions for available booking slots
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/suggestions")
    public BookingSuggestion getSuggestion(@RequestParam String resourceId,
                                           @RequestParam String date,
                                           @RequestParam String startTime,
                                           @RequestParam String endTime) {
        // Returns suggested available time slot
        return service.getSuggestedSlot(resourceId, date, startTime, endTime);
    }

    // ================= APPROVE BOOKING =================

    // Only ADMIN can approve a booking
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id, @RequestParam String admin) {
        // Update status to APPROVED
        return service.updateBookingStatus(id, "APPROVED", "Approved successfully", admin);
    }

    // ================= REJECT BOOKING =================

    // Only ADMIN can reject a booking
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @RequestParam String reason, // Reason for rejection
                          @RequestParam String admin) {
        // Update status to REJECTED
        return service.updateBookingStatus(id, "REJECTED", reason, admin);
    }

    // ================= CANCEL BOOKING =================

    // USER and ADMIN can cancel a booking
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestParam(required = false, defaultValue = "Cancelled by user") String reason,
                          @RequestParam(required = false, defaultValue = "USER") String admin) {
        // Update status to CANCELLED
        return service.updateBookingStatus(id, "CANCELLED", reason, admin);
    }

    // ================= DELETE BOOKING =================

    // Only ADMIN can delete a booking
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteBooking(id);
    }
}