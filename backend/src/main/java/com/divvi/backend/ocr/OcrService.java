package com.divvi.backend.ocr;

import com.divvi.backend.ocr.dto.OcrWord;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.AnnotateImageRequest;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.EntityAnnotation;
import com.google.cloud.vision.v1.Feature;
import com.google.cloud.vision.v1.Image;
import com.google.cloud.vision.v1.ImageAnnotatorClient;
import com.google.cloud.vision.v1.ImageAnnotatorSettings;
import com.google.cloud.vision.v1.Vertex;
import com.google.protobuf.ByteString;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class OcrService {

    public List<OcrWord> extractWords(Path imagePath) {
        AnnotateImageResponse response = runTextDetection(imagePath);

        List<EntityAnnotation> annotations = response.getTextAnnotationsList();

        if (annotations.size() <= 1) {
            return List.of();
        }

        List<OcrWord> words = new ArrayList<>();

        for (int i = 1; i < annotations.size(); i++) {
            EntityAnnotation annotation = annotations.get(i);

            String text = annotation.getDescription();

            List<Vertex> vertices = annotation
                    .getBoundingPoly()
                    .getVerticesList();

            if (vertices.isEmpty()) {
                continue;
            }

            int x = vertices.stream()
                    .mapToInt(Vertex::getX)
                    .min()
                    .orElse(0);

            int y = vertices.stream()
                    .mapToInt(Vertex::getY)
                    .min()
                    .orElse(0);

            words.add(new OcrWord(text, x, y));
        }

        return words;
    }

    private AnnotateImageResponse runTextDetection(Path imagePath) {
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

            try (ImageAnnotatorClient client = createVisionClient()) {
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

                return response;
            }
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to read image for OCR"
            );
        }
    }

    private ImageAnnotatorClient createVisionClient() throws IOException {
        String credentialsJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON");
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
            ).createScoped("https://www.googleapis.com/auth/cloud-platform");
            ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();
            return ImageAnnotatorClient.create(settings);
        }
        return ImageAnnotatorClient.create();
    }
}