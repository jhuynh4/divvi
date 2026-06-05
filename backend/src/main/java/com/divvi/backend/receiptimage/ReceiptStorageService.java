package com.divvi.backend.receiptimage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.IOException;

@Service
public class ReceiptStorageService {

    private final S3Client s3Client;

    private final String bucketName;


    public ReceiptStorageService(
            S3Client s3Client,
            @Value("${app.aws.s3.bucket}") String bucketName
    ) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    public void uploadFile(
            String key,
            MultipartFile file
    ) throws IOException {

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

        s3Client.putObject(
                request,
                RequestBody.fromBytes(file.getBytes())
        );
    }

    public void deleteFile(String key) {
        DeleteObjectRequest request =
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

        s3Client.deleteObject(request);
    }

    public byte[] downloadFile(String key) {

        GetObjectRequest request =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

        return s3Client
                .getObjectAsBytes(request)
                .asByteArray();
    }
}