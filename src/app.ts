import { normalizeConfig, distributeSegments, type WheelConfig } from "./config/config-base";
import { teamConfig } from "./config/config-team";
import { duosConfig } from "./config/config-duos";
import { solosConfig } from "./config/config-solos";
import { generateSpinSound, generateWinSound, generateClickSound, playSound } from "./sound";

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
    let newConfig: WheelConfig;
    switch(configType) {
      case "team":
        newConfig = teamConfig;
        break;
      case "duos":
        newConfig = duosConfig;
        break;
      case "solos":
        newConfig = solosConfig;
        break;
      default:
        newConfig = teamConfig;
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

// Initialize the wheel with team config as default
const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const wheel = new WheelOfFortune(canvas, teamConfig);

// Export for potential future use
(window as any).wheel = wheel;
