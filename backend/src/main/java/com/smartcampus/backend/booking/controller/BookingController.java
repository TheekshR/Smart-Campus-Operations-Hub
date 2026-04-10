package com.smartcampus.backend.booking.controller;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.model.BookingSuggestion;
import com.smartcampus.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking) {
        return service.createBooking(booking);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getBookingById(id);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable String userId) {
        return service.getBookingsByUserId(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public List<Booking> getByStatus(@PathVariable String status) {
        return service.getBookingsByStatus(status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResourceId(@PathVariable String resourceId) {
        return service.getBookingsByResourceId(resourceId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/date/{date}")
    public List<Booking> getByDate(@PathVariable String date) {
        return service.getBookingsByDate(date);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/suggestions")
    public BookingSuggestion getSuggestion(@RequestParam String resourceId,
                                           @RequestParam String date,
                                           @RequestParam String startTime,
                                           @RequestParam String endTime) {
        return service.getSuggestedSlot(resourceId, date, startTime, endTime);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id, @RequestParam String admin) {
        return service.updateBookingStatus(id, "APPROVED", "Approved successfully", admin);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @RequestParam String reason,
                          @RequestParam String admin) {
        return service.updateBookingStatus(id, "REJECTED", reason, admin);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestParam(required = false, defaultValue = "Cancelled by user") String reason,
                          @RequestParam(required = false, defaultValue = "USER") String admin) {
        return service.updateBookingStatus(id, "CANCELLED", reason, admin);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteBooking(id);
    }
}