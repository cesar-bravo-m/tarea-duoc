package com.example.hospitalscheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class HospitalschedulerApplication {

	public static void main(String[] args) {
		SpringApplication.run(HospitalschedulerApplication.class, args);
	}

	@GetMapping("/hello")
	public String helloWorld() {
		return "Hello World";
	}

}
