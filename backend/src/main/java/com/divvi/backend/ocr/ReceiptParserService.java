package com.divvi.backend.ocr;

import com.divvi.backend.ocr.dto.OcrWord;
import com.divvi.backend.ocr.dto.ParsedReceiptItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ReceiptParserService {

    public List<ParsedReceiptItem> parseItemsFromWords(List<OcrWord> words) {
        List<List<OcrWord>> rows = groupWordsIntoRows(words);
        List<ParsedReceiptItem> items = new ArrayList<>();

        for (List<OcrWord> row : rows) {
            row.sort(Comparator.comparingInt(OcrWord::x));

            String rowText = joinWords(row);

            if (!looksLikeItemRow(rowText)) {
                continue;
            }

            BigDecimal price = findItemPrice(row);

            if (price == null) {
                continue;
            }

            String nameText = removePriceFromRow(rowText);
            ItemCandidate candidate = parseItemCandidate(nameText);

            if (candidate.name().isBlank()
                    || !candidate.name().matches(".*[A-Za-z].*")) {
                continue;
            }

            addParsedItems(items, candidate, price);
        }

        return items;
    }

    private List<List<OcrWord>> groupWordsIntoRows(List<OcrWord> words) {
        List<OcrWord> sortedWords = words.stream()
                .sorted(Comparator.comparingInt(OcrWord::y))
                .toList();

        List<List<OcrWord>> rows = new ArrayList<>();
        int rowThreshold = 12;

        for (OcrWord word : sortedWords) {
            List<OcrWord> matchingRow = null;

            for (List<OcrWord> row : rows) {
                int rowY = averageY(row);

                if (Math.abs(word.y() - rowY) <= rowThreshold) {
                    matchingRow = row;
                    break;
                }
            }

            if (matchingRow == null) {
                List<OcrWord> newRow = new ArrayList<>();
                newRow.add(word);
                rows.add(newRow);
            } else {
                matchingRow.add(word);
            }
        }

        return rows;
    }

    private int averageY(List<OcrWord> row) {
        return (int) row.stream()
                .mapToInt(OcrWord::y)
                .average()
                .orElse(0);
    }

    private String joinWords(List<OcrWord> row) {
        return row.stream()
                .sorted(Comparator.comparingInt(OcrWord::x))
                .map(OcrWord::text)
                .reduce((a, b) -> a + " " + b)
                .orElse("");
    }

    private BigDecimal findItemPrice(List<OcrWord> row) {
        return row.stream()
                .filter(word -> looksLikePrice(word.text()))
                .min(Comparator.comparingInt(OcrWord::x))
                .map(word -> parsePrice(word.text()))
                .orElse(null);
    }

    private String removePriceFromRow(String rowText) {
        return rowText
                .replaceAll("\\$?\\d+\\.\\d{2}", "")
                .replace("$", "")
                .replace("-", "")
                .trim();
    }

    private boolean looksLikeItemRow(String rowText) {
        String lower = rowText.toLowerCase();

        return !lower.contains("tax")
                && !lower.contains("total")
                && !lower.contains("subtotal")
                && !lower.contains("phone")
                && !lower.contains("date")
                && !lower.contains("thank")
                && !lower.contains("city")
                && !lower.contains("diner")
                && !rowText.matches(".*\\d{3}.*")
                && rowText.matches(".*\\$?\\d+\\.\\d{2}.*");
    }

    private boolean looksLikePrice(String text) {
        return text.matches("^\\$?\\d+\\.\\d{2}$");
    }

    private BigDecimal parsePrice(String text) {
        return new BigDecimal(text.replace("$", ""));
    }

    private ItemCandidate parseItemCandidate(String rowText) {
        String cleaned = rowText.trim();

        String quantityText = cleaned.replaceFirst("^([0-9]+)\\s*x\\s+.*$", "$1");

        int quantity = 1;

        if (!quantityText.equals(cleaned)) {
            quantity = Integer.parseInt(quantityText);
        }

        String name = cleaned
                .replaceFirst("^\\d+\\s*x\\s*", "")
                .replaceFirst("^\\d+x\\s*", "")
                .trim();

        return new ItemCandidate(name, quantity);
    }

    private void addParsedItems(
            List<ParsedReceiptItem> items,
            ItemCandidate candidate,
            BigDecimal linePrice
    ) {
        BigDecimal unitPrice = linePrice.divide(
                BigDecimal.valueOf(candidate.quantity()),
                2,
                RoundingMode.HALF_UP
        );

        for (int i = 0; i < candidate.quantity(); i++) {
            items.add(new ParsedReceiptItem(
                    candidate.name(),
                    unitPrice
            ));
        }
    }

    private record ItemCandidate(
            String name,
            int quantity
    ) {}
}