package com.smartcampus.backend.booking.repository;

import com.smartcampus.backend.booking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// Repository interface for managing Booking entities in MongoDB
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceIdAndDate(String resourceId, String date);

    List<Booking> findByStatus(String status);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByDate(String date);

    List<Booking> findByResourceIdAndDateOrderByStartTimeAsc(String resourceId, String date);
}