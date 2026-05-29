package com.divvi.backend.ocr;

import com.google.cloud.vision.v1.AnnotateImageRequest;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.Feature;
import com.google.cloud.vision.v1.Image;
import com.google.cloud.vision.v1.ImageAnnotatorClient;
import com.google.protobuf.ByteString;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class OcrService {

    public String extractText(Path imagePath) {
        try {
            ByteString imageBytes = ByteString.copyFrom(
                    Files.readAllBytes(imagePath)
            );

            Image image = Image.newBuilder()
                    .setContent(imageBytes)
                    .build();

            Feature feature = Feature.newBuilder()
                    .setType(Feature.Type.TEXT_DETECTION)
                    .build();

            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(feature)
                    .setImage(image)
                    .build();

            try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
                List<AnnotateImageResponse> responses =
                        client.batchAnnotateImages(List.of(request))
                                .getResponsesList();

                AnnotateImageResponse response = responses.get(0);

                if (response.hasError()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_GATEWAY,
                            response.getError().getMessage()
                    );
                }

                return response.getFullTextAnnotation().getText();
            }
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to read image for OCR"
            );
        }
    }
}