package com.smartcampus.backend.booking.controller;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.backend.booking.model.BookingSuggestion;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking) {
        return service.createBooking(booking);
    }

    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getBookingById(id);
    }

    @GetMapping("/suggestions")
    public BookingSuggestion getSuggestion(@RequestParam String resourceId,
                                       @RequestParam String date,
                                       @RequestParam String startTime,
                                       @RequestParam String endTime) {
    return service.getSuggestedSlot(resourceId, date, startTime, endTime);
}

    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable String userId) {
        return service.getBookingsByUserId(userId);
    }

    @GetMapping("/status/{status}")
    public List<Booking> getByStatus(@PathVariable String status) {
        return service.getBookingsByStatus(status);
    }

    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResourceId(@PathVariable String resourceId) {
        return service.getBookingsByResourceId(resourceId);
    }

    @GetMapping("/date/{date}")
    public List<Booking> getByDate(@PathVariable String date) {
        return service.getBookingsByDate(date);
    }

    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id, @RequestParam String admin) {
        return service.updateBookingStatus(id, "APPROVED", "Approved successfully", admin);
    }

    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @RequestParam String reason,
                          @RequestParam String admin) {
        return service.updateBookingStatus(id, "REJECTED", reason, admin);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestParam(required = false, defaultValue = "Cancelled by user") String reason,
                          @RequestParam(required = false, defaultValue = "USER") String admin) {
        return service.updateBookingStatus(id, "CANCELLED", reason, admin);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteBooking(id);
    }

    
}