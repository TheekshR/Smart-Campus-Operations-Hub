package com.smartcampus.backend.booking.repository;

import com.smartcampus.backend.booking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceIdAndDate(String resourceId, String date);
}