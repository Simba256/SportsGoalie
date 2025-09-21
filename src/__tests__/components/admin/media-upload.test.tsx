import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MediaUpload } from '../../../../components/admin/media-upload';

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

describe('MediaUpload', () => {
  const user = userEvent.setup();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  const defaultProps = {
    onUpload: mockOnUpload,
    acceptedTypes: ['image/*', 'video/*'],
    maxFiles: 5,
    maxSizePerFile: 10, // 10MB
  };

  it('renders upload area correctly', () => {
    render(<MediaUpload {...defaultProps} />);

    expect(screen.getByText('Upload Media Files')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here, or click to select files')).toBeInTheDocument();
    expect(screen.getByText('Supported: image/*, video/* • Max 10MB per file • Max 5 files')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument();
  });

  it('handles file selection through button click', async () => {
    render(<MediaUpload {...defaultProps} />);

    const selectButton = screen.getByRole('button', { name: /select files/i });

    // Create a mock file
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, file);

    expect(mockOnUpload).toHaveBeenCalledWith([expect.objectContaining({
      name: 'test.jpg',
      type: 'image/jpeg',
    })]);
  });

  it('handles drag and drop functionality', async () => {
    render(<MediaUpload {...defaultProps} />);

    const dropZone = screen.getByText('Upload Media Files').closest('.border-dashed')?.parentElement;
    expect(dropZone).toBeInTheDocument();

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const dataTransfer = {
      files: [file],
    };

    fireEvent.dragOver(dropZone!, { dataTransfer });
    fireEvent.drop(dropZone!, { dataTransfer });

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([expect.objectContaining({
        name: 'test.jpg',
        type: 'image/jpeg',
      })]);
    });
  });

  it('validates file size correctly', async () => {
    render(<MediaUpload {...defaultProps} />);

    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 10MB/)).toBeInTheDocument();
    });

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it('validates file type correctly', async () => {
    render(<MediaUpload {...defaultProps} />);

    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/File type not supported/)).toBeInTheDocument();
    });

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it('enforces maximum file limit', async () => {
    render(<MediaUpload {...defaultProps} maxFiles={2} />);

    const files = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
      new File(['content3'], 'file3.jpg', { type: 'image/jpeg' }),
    ];

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText(/Maximum 2 files allowed/)).toBeInTheDocument();
    });

    // Should only upload first 2 files
    expect(mockOnUpload).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'file1.jpg' }),
      expect.objectContaining({ name: 'file2.jpg' }),
    ]);
  });

  it('displays uploaded files correctly', async () => {
    render(<MediaUpload {...defaultProps} />);

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Selected Files (1)')).toBeInTheDocument();
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByText(/image\/jpeg/)).toBeInTheDocument();
    });
  });

  it('creates preview for image files', async () => {
    render(<MediaUpload {...defaultProps} />);

    const imageFile = new File(['image content'], 'image.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, imageFile);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(imageFile);
      expect(screen.getByAltText('image.jpg')).toBeInTheDocument();
    });
  });

  it('displays generic icon for non-image files', async () => {
    render(<MediaUpload {...defaultProps} />);

    const videoFile = new File(['video content'], 'video.mp4', { type: 'video/mp4' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, videoFile);

    await waitFor(() => {
      expect(screen.getByText('video.mp4')).toBeInTheDocument();
      // Should display video icon, not image preview
      expect(screen.queryByAltText('video.mp4')).not.toBeInTheDocument();
    });
  });

  it('allows removing individual files', async () => {
    render(<MediaUpload {...defaultProps} />);

    const files = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
    ];

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText('Selected Files (2)')).toBeInTheDocument();
    });

    // Remove first file
    const removeButtons = screen.getAllByRole('button');
    const firstRemoveButton = removeButtons.find(button =>
      button.getAttribute('class')?.includes('text-red-600')
    );

    if (firstRemoveButton) {
      await user.click(firstRemoveButton);
    }

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenLastCalledWith([
        expect.objectContaining({ name: 'file2.jpg' }),
      ]);
    });
  });

  it('clears all files', async () => {
    render(<MediaUpload {...defaultProps} />);

    const files = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
    ];

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText('Selected Files (2)')).toBeInTheDocument();
    });

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);

    expect(mockOnUpload).toHaveBeenLastCalledWith([]);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Selected Files')).not.toBeInTheDocument();
  });

  it('formats file sizes correctly', async () => {
    render(<MediaUpload {...defaultProps} />);

    const smallFile = new File(['x'.repeat(500)], 'small.jpg', { type: 'image/jpeg' });
    const mediumFile = new File(['x'.repeat(1500)], 'medium.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, [smallFile, mediumFile]);

    await waitFor(() => {
      expect(screen.getByText(/500 Bytes/)).toBeInTheDocument();
      expect(screen.getByText(/1.46 KB/)).toBeInTheDocument();
    });
  });

  it('disables select button when max files reached', async () => {
    render(<MediaUpload {...defaultProps} maxFiles={1} />);

    const file = new File(['content'], 'file.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select files/i })).toBeDisabled();
    });
  });

  it('dismisses error messages', async () => {
    render(<MediaUpload {...defaultProps} />);

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    const fileInput = screen.getByRole('button', { name: /select files/i }).nextElementSibling as HTMLInputElement;

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/File type not supported/)).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole('button', { name: '' }); // X button
    await user.click(dismissButton);

    expect(screen.queryByText(/File type not supported/)).not.toBeInTheDocument();
  });

  it('handles drag over and drag leave events', async () => {
    render(<MediaUpload {...defaultProps} />);

    const dropZone = screen.getByText('Upload Media Files').closest('.border-dashed')?.parentElement;
    expect(dropZone).toHaveClass('border-muted-foreground/25');

    fireEvent.dragOver(dropZone!);
    expect(dropZone).toHaveClass('border-primary');

    fireEvent.dragLeave(dropZone!);
    expect(dropZone).toHaveClass('border-muted-foreground/25');
  });

  it('accepts custom accepted types', () => {
    render(<MediaUpload {...defaultProps} acceptedTypes={['image/png', 'image/jpeg']} />);

    expect(screen.getByText('Supported: image/png, image/jpeg • Max 10MB per file • Max 5 files')).toBeInTheDocument();
  });

  it('accepts custom max size and file limits', () => {
    render(<MediaUpload {...defaultProps} maxSizePerFile={50} maxFiles={10} />);

    expect(screen.getByText('Supported: image/*, video/* • Max 50MB per file • Max 10 files')).toBeInTheDocument();
  });
});