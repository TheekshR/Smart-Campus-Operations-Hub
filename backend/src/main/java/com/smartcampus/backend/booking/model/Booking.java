package com.smartcampus.backend.booking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String resourceId;
    private String userId;
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private int attendees;
    private String status;
}