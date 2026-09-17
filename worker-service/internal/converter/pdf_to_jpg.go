package converter

import (
	"archive/zip"
	"context"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/h2non/bimg"
	"github.com/pdfcpu/pdfcpu/pkg/api"
)

// PdfToJpg extracts each page of a PDF as a JPG and streams it into a local ZIP file.
// Emits progress updates via a callback to ensure the frontend can show real-time progress.
func PdfToJpg(ctx context.Context, inPath string, outZipPath string, quality int, progressCb func(int, string)) error {
	// First, determine page count using pdfcpu (lightweight)
	pageCount, err := api.PageCountFile(inPath)
	if err != nil {
		return fmt.Errorf("failed to get page count: %w", err)
	}

	if pageCount == 0 {
		return fmt.Errorf("PDF has no pages")
	}

	// Create the temporary zip file
	zipFile, err := os.Create(outZipPath)
	if err != nil {
		return fmt.Errorf("failed to create zip file: %w", err)
	}
	
	zipWriter := zip.NewWriter(zipFile)

	// Read the PDF into memory once. 
	// A 100MB PDF takes 100MB of RAM, which is completely fine and safe from OOM.
	// OOM happens when *rasterized* images are stored.
	pdfBytes, err := ioutil.ReadFile(inPath)
	if err != nil {
		zipWriter.Close()
		zipFile.Close()
		return fmt.Errorf("failed to read PDF file: %w", err)
	}

	for i := 0; i < pageCount; i++ {
		// Check context cancellation
		select {
		case <-ctx.Done():
			zipWriter.Close()
			zipFile.Close()
			return ctx.Err()
		default:
		}

		// Report progress
		if progressCb != nil {
			pct := 10 + int((float64(i) / float64(pageCount)) * 70) // 10% to 80%
			progressCb(pct, fmt.Sprintf("Extracting page %d of %d", i+1, pageCount))
		}

		// Configure libvips to extract the specific page
		options := bimg.Options{
			Type:    bimg.JPEG,
			Quality: quality,
			Page:    i,
		}

		// Process the page
		// bimg will call vips_pdfload to render only the requested page
		imgBuffer, err := bimg.NewImage(pdfBytes).Process(options)
		if err != nil {
			zipWriter.Close()
			zipFile.Close()
			return fmt.Errorf("failed to extract page %d: %w", i+1, err)
		}

		// Create a new file within the zip
		f, err := zipWriter.Create(fmt.Sprintf("page_%d.jpg", i+1))
		if err != nil {
			zipWriter.Close()
			zipFile.Close()
			return fmt.Errorf("failed to add page %d to zip: %w", i+1, err)
		}

		// Stream the JPEG buffer directly into the zip.Writer
		_, err = f.Write(imgBuffer)
		if err != nil {
			zipWriter.Close()
			zipFile.Close()
			return fmt.Errorf("failed to write page %d to zip: %w", i+1, err)
		}
		
		// Let GC quickly reclaim the image buffer
		imgBuffer = nil
	}

	// Finalize zip
	if err := zipWriter.Close(); err != nil {
		zipFile.Close()
		return fmt.Errorf("failed to close zip writer: %w", err)
	}

	if err := zipFile.Close(); err != nil {
		return fmt.Errorf("failed to close zip file: %w", err)
	}

	return nil
}
