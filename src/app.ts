import { normalizeConfig, distributeSegments, type WheelConfig } from "./config/config-base";
import { teamsConfig } from "./config/config-teams";
import { duosConfig } from "./config/config-duos";
import { solosConfig } from "./config/config-solos";
import { generateSpinSound, generateWinSound, generateClickSound, playSound } from "./sound";
import { postToDiscord } from "./discord";
import { discordConfig } from "./config/discord-config";

// Visual configuration
// Note: Pointer color is defined in styles.css (.pointer class, line 59)
const WHEEL_CONFIG = {
  segments: {
    color1: "#1a1a1a",        // First alternating segment color
    color2: "#2d2d2d",        // Second alternating segment color
    borderColor: "#444",      // Border between segments
    borderWidth: 2
  },
  images: {
    width: 80,                // Target width for boss images
    maxHeight: 100            // Maximum height (maintains aspect ratio)
  },
  center: {
    color: "#fff",            // Center circle fill color
    borderColor: "#333",      // Center circle border color
    borderWidth: 5,
    radius: 45
  },
  text: {
    font: "bold 13px Arial, sans-serif",
    outlineColor: "#000000",  // Text stroke/outline color
    outlineWidth: 3,
    fillColor: "#FFFF00"      // Text fill color (OSRS yellow)
  }
};

// Toast notification helper
function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// OTP modal helper
function showOTPModal(
  onSubmit: (code: string) => void,
  onCancel: () => void
): void {
  const modal = document.createElement("div");
  modal.className = "otp-modal";
  modal.innerHTML = `
    <div class="otp-modal-content">
      <div class="otp-input-container">
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        <input type="text" class="otp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" />
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const inputs = modal.querySelectorAll<HTMLInputElement>(".otp-digit");

  // Auto-focus first input
  setTimeout(() => inputs[0].focus(), 100);

  // Handle input
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;

      // Only allow digits
      if (!/^\d*$/.test(value)) {
        input.value = "";
        return;
      }

      // Move to next input if digit entered
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Auto-submit when last digit is entered
      if (index === inputs.length - 1 && value.length === 1) {
        const code = Array.from(inputs)
          .map((i) => i.value)
          .join("");
        if (code.length === 6) {
          modal.remove();
          onSubmit(code);
        }
      }
    });

    // Handle backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus();
      }

      // Handle Enter key - submit if all 6 digits entered
      if (e.key === "Enter") {
        const code = Array.from(inputs)
          .map((i) => i.value)
          .join("");
        if (code.length === 6) {
          modal.remove();
          onSubmit(code);
        }
      }
    });

    // Handle paste
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData?.getData("text") || "";
      const digits = pastedData.replace(/\D/g, "").slice(0, 6);

      digits.split("").forEach((digit, i) => {
        if (inputs[i]) {
          inputs[i].value = digit;
        }
      });

      // Focus last filled input or first empty
      const lastIndex = Math.min(digits.length, inputs.length - 1);
      inputs[lastIndex].focus();

      // Auto-submit if 6 digits pasted
      if (digits.length === 6) {
        modal.remove();
        onSubmit(digits);
      }
    });
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
      onCancel();
    }
  });

  // Show modal with animation
  setTimeout(() => modal.classList.add("show"), 10);
}

class WheelOfFortune {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: WheelConfig;
  private segments: string[];
  private segmentImageUrls: Map<number, string> = new Map(); // Maps segment index to selected image URL
  private currentRotation: number = 0;
  private isSpinning: boolean = false;
  private spinButton: HTMLButtonElement;
  private resultDiv: HTMLDivElement;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;
  private lastSegmentIndex: number = -1;
  private currentConfigType: string = "teams"; // Track current config type for Discord

  constructor(canvas: HTMLCanvasElement, config: WheelConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = normalizeConfig(config);
    this.segments = distributeSegments(this.config);
    this.assignSegmentImages();
    this.spinButton = document.getElementById("spin-button") as HTMLButtonElement;
    this.resultDiv = document.getElementById("result") as HTMLDivElement;

    this.preloadImages().then(() => {
      this.imagesLoaded = true;
      this.drawWheel();
    });
    this.setupEventListeners();
  }

  private assignSegmentImages() {
    // For each segment, randomly pick an image URL if multiple are available
    this.segmentImageUrls.clear();
    this.segments.forEach((segmentName, index) => {
      const item = this.config.items.find(i => i.name === segmentName);
      if (item && item.imageUrl) {
        if (Array.isArray(item.imageUrl)) {
          // Pick a random image from the array
          const randomIndex = Math.floor(Math.random() * item.imageUrl.length);
          this.segmentImageUrls.set(index, item.imageUrl[randomIndex]);
        } else {
          // Single image URL
          this.segmentImageUrls.set(index, item.imageUrl);
        }
      }
    });
  }

  private async preloadImages(): Promise<void> {
    const imagePromises: Promise<void>[] = [];

    this.config.items
      .filter(item => item.imageUrl)
      .forEach(item => {
        const urls = Array.isArray(item.imageUrl) ? item.imageUrl : [item.imageUrl!];

        urls.forEach(url => {
          const promise = new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              this.imageCache.set(url, img);
              console.log(`✓ Loaded image: ${url}`);
              resolve();
            };
            img.onerror = (error) => {
              console.error(`✗ Failed to load image:`, url);
              resolve(); // Resolve anyway to not block other images
            };
            img.src = url;
          });
          imagePromises.push(promise);
        });
      });

    await Promise.all(imagePromises);
    console.log(`Image cache loaded: ${this.imageCache.size} images`);
  }

  private setupEventListeners() {
    this.spinButton.addEventListener("click", () => this.spin());
    this.canvas.addEventListener("click", () => this.spin());
    this.canvas.style.cursor = "pointer";

    // Setup config radio buttons
    const radioButtons = document.querySelectorAll('input[name="config"]');
    radioButtons.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        this.loadConfig(target.value);
      });
    });
  }

  private loadConfig(configType: string) {
    this.currentConfigType = configType;
    let newConfig: WheelConfig;
    switch(configType) {
      case "teams":
        newConfig = teamsConfig;
        break;
      case "duos":
        newConfig = duosConfig;
        break;
      case "solos":
        newConfig = solosConfig;
        break;
      default:
        newConfig = teamsConfig;
    }
    this.updateConfig(newConfig);
  }

  private drawWheel() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context and rotate
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.currentRotation);

    const segmentAngle = (2 * Math.PI) / this.segments.length;

    // Draw segments
    this.segments.forEach((segmentName, index) => {
      const item = this.config.items.find(i => i.name === segmentName)!;
      console.log(item)

      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Draw segment with alternating black/grey colors
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = index % 2 === 0 ? WHEEL_CONFIG.segments.color1 : WHEEL_CONFIG.segments.color2;
      this.ctx.fill();

      // Draw border
      this.ctx.strokeStyle = WHEEL_CONFIG.segments.borderColor;
      this.ctx.lineWidth = WHEEL_CONFIG.segments.borderWidth;
      this.ctx.stroke();

      // Calculate position for content (image + text)
      this.ctx.save();
      const segmentMidAngle = startAngle + segmentAngle / 2;
      this.ctx.rotate(segmentMidAngle);

      // Get the assigned image URL for this specific segment instance
      const imageUrl = this.segmentImageUrls.get(index);
      const image = imageUrl ? this.imageCache.get(imageUrl) : undefined;

      // Image at the top (outer edge) of the segment
      const imageRadius = radius - 60; // Near the outer edge

      // Draw image at the outer edge of THIS segment
      if (image) {
        this.ctx.save();
        this.ctx.rotate(5 * Math.PI / 2);
        this.ctx.translate(0, -imageRadius);
        // Don't counter-rotate - let the image rotate with the segment
        // But rotate 90 degrees so top of image points outward

        this.ctx.rotate(0);

        // Calculate dimensions to maintain aspect ratio with max height constraint
        const aspectRatio = image.height / image.width;
        let imageWidth = WHEEL_CONFIG.images.width;
        let imageHeight = imageWidth * aspectRatio;

        // Cap height at max and scale width proportionally if needed
        if (imageHeight > WHEEL_CONFIG.images.maxHeight) {
          imageHeight = WHEEL_CONFIG.images.maxHeight;
          imageWidth = imageHeight / aspectRatio;
        }

        this.ctx.drawImage(
          image,
          -imageWidth / 2,
          -imageHeight / 2,
          imageWidth,
          imageHeight
        );

        this.ctx.restore();
      }

      // Draw text in the middle of the segment
      const textRadius = radius * 0.55; // Middle of segment

      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = WHEEL_CONFIG.text.font;

      // OSRS-style text: black outline with yellow fill
      this.ctx.lineWidth = WHEEL_CONFIG.text.outlineWidth;
      this.ctx.strokeStyle = WHEEL_CONFIG.text.outlineColor;
      this.ctx.fillStyle = WHEEL_CONFIG.text.fillColor;

      // Determine if we need to flip text for left side
      const normalizedAngle = ((this.currentRotation + segmentMidAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const isLeftSide = normalizedAngle > Math.PI / 2 && normalizedAngle < 3 * Math.PI / 2;

      if (isLeftSide) {
        // Flip text 180 degrees for left side to read left-to-right
        this.ctx.rotate(Math.PI);
        this.ctx.strokeText(segmentName, -textRadius, 0);
        this.ctx.fillText(segmentName, -textRadius, 0);
      } else {
        this.ctx.strokeText(segmentName, textRadius, 0);
        this.ctx.fillText(segmentName, textRadius, 0);
      }

      this.ctx.restore();
    });

    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, WHEEL_CONFIG.center.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = WHEEL_CONFIG.center.color;
    this.ctx.fill();
    this.ctx.strokeStyle = WHEEL_CONFIG.center.borderColor;
    this.ctx.lineWidth = WHEEL_CONFIG.center.borderWidth;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private easeOutQuart(x: number): number {
    // Gentle, gradual slowdown throughout the entire spin
    // Lower exponent = earlier and more gradual deceleration
    return 1 - Math.pow(1 - x, 2.5);
  }

  private getWinningSegmentIndex(): number {
    // The pointer is at the top (12 o'clock)
    // In canvas coordinates: 0° is 3 o'clock, 90° is 6 o'clock, 180° is 9 o'clock, 270° is 12 o'clock
    // So the pointer is at 270° = 3π/2 radians = -π/2 radians

    const segmentAngle = (2 * Math.PI) / this.segments.length;

    // Normalize rotation to 0-2PI
    let normalizedRotation = this.currentRotation % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;

    // The pointer is at -90 degrees from the starting point (3 o'clock)
    // So we need to find which segment is at angle: -PI/2 - rotation
    // Which is the same as: 3PI/2 - rotation
    let pointerAngle = (3 * Math.PI / 2 - normalizedRotation) % (2 * Math.PI);
    if (pointerAngle < 0) pointerAngle += 2 * Math.PI;

    // Determine which segment this angle falls into
    const segmentIndex = Math.floor(pointerAngle / segmentAngle) % this.segments.length;

    return segmentIndex;
  }

  public async spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.spinButton.disabled = true;
    this.resultDiv.innerHTML = "";
    this.lastSegmentIndex = -1; // Reset for new spin

    // Calculate randomized spin duration from config
    const variance = (Math.random() - 0.5) * 2 * this.config.spinVariance;
    const duration = this.config.spinDuration + variance;

    // Play spin sound
    // const spinSoundUrl = generateSpinSound(duration / 1000);
    // playSound(spinSoundUrl);

    // Random spin parameters
    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + randomAngle;

    const startTime = Date.now();
    const startRotation = this.currentRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = this.easeOutQuart(progress);
      this.currentRotation = startRotation + totalRotation * easedProgress;

      // Check if we've crossed into a new segment and play click
      const segmentAngle = (2 * Math.PI) / this.segments.length;
      let normalizedRotation = this.currentRotation % (2 * Math.PI);
      if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
      let pointerAngle = (3 * Math.PI / 2 - normalizedRotation) % (2 * Math.PI);
      if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
      const currentSegmentIndex = Math.floor(pointerAngle / segmentAngle) % this.segments.length;

      if (currentSegmentIndex !== this.lastSegmentIndex && this.lastSegmentIndex !== -1 && progress < 1) {
        // Segment changed - play click (generate fresh sound each time)
        const clickSoundUrl = generateClickSound();
        playSound(clickSoundUrl);
      }
      this.lastSegmentIndex = currentSegmentIndex;

      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin complete
        this.isSpinning = false;
        this.spinButton.disabled = false;

        const winnerSegmentIndex = this.getWinningSegmentIndex();
        const winner = this.segments[winnerSegmentIndex];

        // Clear and build result modal
        this.resultDiv.innerHTML = "";
        this.resultDiv.classList.remove("show");

        const winnerItem = this.config.items.find(item => item.name === winner);
        const winnerImageUrl = this.segmentImageUrls.get(winnerSegmentIndex);
        const image = winnerImageUrl ? this.imageCache.get(winnerImageUrl) : undefined;

        if (image && winnerImageUrl) {
          const imgElement = document.createElement("img");
          imgElement.src = winnerImageUrl;
          imgElement.className = "result-image";
          imgElement.crossOrigin = "anonymous";
          this.resultDiv.appendChild(imgElement);
        }

        const textElement = document.createElement("div");
        textElement.textContent = `${winner}`;
        textElement.className = "result-text";
        this.resultDiv.appendChild(textElement);

        // Add wiki links if available
        if (winnerItem?.wikiUrl) {
          const linksContainer = document.createElement("div");
          linksContainer.className = "result-links";

          // Getting there button
          const gettingThereButton = document.createElement("button");
          const gettingThereUrl = `${winnerItem.wikiUrl}/Strategies#Transportation`;
          gettingThereButton.className = "result-link";
          gettingThereButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span>Getting There</span>
          `;
          gettingThereButton.addEventListener("click", async (e) => {
            e.stopPropagation();
            await navigator.clipboard.writeText(gettingThereUrl);
            // Show visual feedback
            const originalText = gettingThereButton.querySelector("span")!.textContent;
            gettingThereButton.querySelector("span")!.textContent = "Copied!";
            setTimeout(() => {
              gettingThereButton.querySelector("span")!.textContent = originalText!;
            }, 1500);
          });
          linksContainer.appendChild(gettingThereButton);

          // Equipment button
          const equipmentButton = document.createElement("button");
          const equipmentUrl = `${winnerItem.wikiUrl}/Strategies#Equipment`;
          equipmentButton.className = "result-link";
          equipmentButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
            <span>Equipment</span>
          `;
          equipmentButton.addEventListener("click", async (e) => {
            e.stopPropagation();
            await navigator.clipboard.writeText(equipmentUrl);
            // Show visual feedback
            const originalText = equipmentButton.querySelector("span")!.textContent;
            equipmentButton.querySelector("span")!.textContent = "Copied!";
            setTimeout(() => {
              equipmentButton.querySelector("span")!.textContent = originalText!;
            }, 1500);
          });
          linksContainer.appendChild(equipmentButton);

          // Add Discord button if enabled
          if (discordConfig._e) {
            const discordButton = document.createElement("button");
            discordButton.className = "result-link discord-link";
            discordButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Post to Discord</span>
            `;
            discordButton.addEventListener("click", async (e) => {
              e.stopPropagation();

              // Show OTP modal
              showOTPModal(
                async (code) => {
                  try {
                    // Post to Discord with the code
                    await postToDiscord(
                      winnerItem,
                      this.currentConfigType,
                      code,
                      winnerImageUrl
                    );
                    showToast("Successfully posted to Discord!");
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Failed to post";
                    showToast(errorMessage, "error");
                  }
                },
                () => {
                  // User cancelled, do nothing
                }
              );
            });
            linksContainer.appendChild(discordButton);
          }

          this.resultDiv.appendChild(linksContainer);
        }

        // Show modal with slight delay for effect
        setTimeout(() => {
          this.resultDiv.classList.add("show");
        }, 100);

        // Hide modal on click
        const hideModal = () => {
          this.resultDiv.classList.remove("show");
          this.resultDiv.removeEventListener("click", hideModal);
        };
        this.resultDiv.addEventListener("click", hideModal);

        // Play win sound
        const winSoundUrl = generateWinSound();
        playSound(winSoundUrl);
      }
    };

    requestAnimationFrame(animate);
  }

  public async updateConfig(newConfig: WheelConfig) {
    this.config = normalizeConfig(newConfig);
    this.segments = distributeSegments(this.config);
    this.assignSegmentImages();

    // Preload any new images
    await this.preloadImages();

    this.drawWheel();
  }
}

// Initialize the wheel with teams config as default
const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const wheel = new WheelOfFortune(canvas, teamsConfig);

// Export for potential future use
(window as any).wheel = wheel;
