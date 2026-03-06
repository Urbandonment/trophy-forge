import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './Home';

// Mock html2canvas
const mockCanvas = {
  toDataURL: () => 'data:image/png;base64,mock-image-data',
  offsetWidth: 600,
  offsetHeight: 200
};

vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve(mockCanvas))
}));

// Mock fetch
global.fetch = vi.fn();

describe('Home Component - Button Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
    
    // Mock createElement and click for download link
    const mockClick = vi.fn();
    global.document.createElement = vi.fn((tagName) => {
      if (tagName === 'a') {
        return {
          download: '',
          href: '',
          click: mockClick
        };
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('UPDATE Button', () => {
    it('should render UPDATE button', () => {
      render(<Home />);
      const updateButton = screen.getByRole('button', { name: /update/i });
      expect(updateButton).toBeInTheDocument();
    });

    it('should show error when UPDATE button is clicked without PSN ID', async () => {
      render(<Home />);
      const updateButton = screen.getByRole('button', { name: /update/i });
      
      await userEvent.click(updateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a psn username/i)).toBeInTheDocument();
      });
    });

    it('should call API when UPDATE button is clicked with valid PSN ID', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/psn-profile/TestUser'),
          expect.objectContaining({ method: 'GET' })
        );
      });
    });

    it('should show error message when API call fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User not found' })
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'InvalidUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
      });
    });

    it('should show loading state when UPDATE button is clicked', async () => {
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('CHANGE IMAGE Button', () => {
    it('should render CHANGE IMAGE button when profile is visible', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        expect(changeImageButton).toBeInTheDocument();
      });
    });

    it('should open function frame when CHANGE IMAGE button is clicked', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(() => {
          expect(screen.getByText(/use image from your latest game/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('CHANGE BORDER Button', () => {
    it('should render CHANGE BORDER button when profile is visible', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        const changeBorderButton = screen.getByRole('button', { name: /change border/i });
        expect(changeBorderButton).toBeInTheDocument();
      });
    });

    it('should open border selection frame when CHANGE BORDER button is clicked', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeBorderButton = screen.getByRole('button', { name: /change border/i });
        await userEvent.click(changeBorderButton);
        
        await waitFor(() => {
          expect(screen.getByText(/select trophy card's border/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('CHANGE LAYOUT Button', () => {
    it('should render CHANGE LAYOUT button when profile is visible', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        const changeLayoutButton = screen.getByRole('button', { name: /change layout/i });
        expect(changeLayoutButton).toBeInTheDocument();
      });
    });

    it('should open layout frame when CHANGE LAYOUT button is clicked', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeLayoutButton = screen.getByRole('button', { name: /change layout/i });
        await userEvent.click(changeLayoutButton);
        
        await waitFor(() => {
          expect(screen.getByText(/layout options go here/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('CAPTURE AS IMAGE Button', () => {
    it('should render CAPTURE AS IMAGE button when profile is visible', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture as image/i });
        expect(captureButton).toBeInTheDocument();
      });
    });

    it('should trigger image capture when CAPTURE AS IMAGE button is clicked', async () => {
      const html2canvas = (await import('html2canvas')).default;
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const captureButton = screen.getByRole('button', { name: /capture as image/i });
        await userEvent.click(captureButton);
        
        await waitFor(() => {
          expect(html2canvas).toHaveBeenCalled();
        });
      });
    });
  });

  describe('OK Button (Change Image)', () => {
    it('should render OK button in change image frame', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(() => {
          const okButton = screen.getByRole('button', { name: /^ok$/i });
          expect(okButton).toBeInTheDocument();
        });
      });
    });

    it('should be disabled when current image matches last game image', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(() => {
          const okButton = screen.getByRole('button', { name: /^ok$/i });
          expect(okButton).toBeDisabled();
        });
      });
    });
  });

  describe('Browse Button', () => {
    it('should render Browse button in change image frame', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(() => {
          const browseButton = screen.getByRole('button', { name: /browse/i });
          expect(browseButton).toBeInTheDocument();
        });
      });
    });

    it('should trigger file input click when Browse button is clicked', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(async () => {
          const browseButton = screen.getByRole('button', { name: /browse/i });
          const fileInput = document.querySelector('input[type="file"]');
          const clickSpy = vi.spyOn(fileInput, 'click');
          
          await userEvent.click(browseButton);
          
          expect(clickSpy).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Upload Button', () => {
    it('should render Upload button in change image frame', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(() => {
          const uploadButton = screen.getByRole('button', { name: /upload/i });
          expect(uploadButton).toBeInTheDocument();
        });
      });
    });

    it('should show alert when Upload button is clicked without URL', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(async () => {
          const uploadButton = screen.getByRole('button', { name: /upload/i });
          await userEvent.click(uploadButton);
          
          await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Please enter an image URL.');
          });
        });
      });
    });

    it('should call API when Upload button is clicked with valid URL', async () => {
      const mockProfileData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        onlineId: 'TestUser',
        isPlus: true,
        level: 100,
        nextLevel: 101,
        platinumTrophies: 10,
        goldTrophies: 20,
        silverTrophies: 30,
        bronzeTrophies: 40,
        earnedTrophies: 100,
        lastGamePlayed: 'Test Game',
        lastGamePlayedImageUrl: 'https://example.com/game.jpg',
        lastGamePlayedLogosUrl: ['https://example.com/logo.jpg']
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => new Blob(['test'], { type: 'image/png' })
        });

      render(<Home />);
      const input = screen.getByPlaceholderText(/enter psn username/i);
      const updateButton = screen.getByRole('button', { name: /update/i });

      await userEvent.type(input, 'TestUser');
      await userEvent.click(updateButton);

      await waitFor(async () => {
        const changeImageButton = screen.getByRole('button', { name: /change image/i });
        await userEvent.click(changeImageButton);
        
        await waitFor(async () => {
          const urlInput = screen.getByPlaceholderText(/paste an image url/i);
          const uploadButton = screen.getByRole('button', { name: /upload/i });
          
          await userEvent.type(urlInput, 'https://example.com/image.jpg');
          await userEvent.click(uploadButton);
          
          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
              expect.stringContaining('/api/proxy-image'),
              expect.any(Object)
            );
          });
        });
      });
    });
  });
});

