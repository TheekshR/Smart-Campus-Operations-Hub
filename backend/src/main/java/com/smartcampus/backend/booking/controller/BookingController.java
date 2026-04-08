package com.smartcampus.backend.booking.controller;

import com.smartcampus.backend.booking.model.Booking;
import com.smartcampus.backend.booking.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking) {
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

    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable String userId) {
        return service.getBookingsByUserId(userId);
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