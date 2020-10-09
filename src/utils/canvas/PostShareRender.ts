import { FetchQRCode } from '../../services/mp'
import { PostShareConfig, BasicUserInfo } from './mp-render';
import { BaseCanvasRender } from "./BaseCanvasRender";

export class PostShareRender extends BaseCanvasRender {
  private offsetY: number = 0;
  private readonly bannerHeight = 120;
  private readonly qrcodeSize = 90;
  private readonly bannerGap = 15; // 120 - 90 / 2
  constructor(dom: HTMLCanvasElement, config: PostShareConfig) {
    super();
    this.dom = dom;
    this.config = config;
    const ctx = dom.getContext('2d');
    if (!ctx) {
      throw new Error('canvas context not found');
    }

    this.ctx = ctx;
    this.offsetY = this.config.padding;
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image()
      img.crossOrigin="anonymous"
      img.onload = () => {
        resolve(img);
      };
      img.onerror = err => {
        console.error(err);
        reject(err);
      };
      img.src = src;
    });
  }

  renderBackground(): Promise<void> {
    this.ctx.save();
    const gradient = this.ctx.createLinearGradient(0, 0, this.scaledWidth, this.scaledHeight);
    gradient.addColorStop(0, '#f2f2f2');
    gradient.addColorStop(1, '#e0e0e0');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.scaledWidth, this.scaledHeight);
    this.ctx.restore();
    return Promise.resolve();
  }
  renderText(): Promise<void> {
    this.ctx.save();
    const y = this.drawText(
      this.config.clipping.content,
      this.scaledPadding,
      this.scaledPadding * 2,
      this.scaledWidth - this.scaledPadding * 2,
      this.config.baseTextSize * 1.5
    );

    this.offsetY = y;
    this.ctx.restore();
    return Promise.resolve();
  }
  renderTitle(): Promise<void> {
    this.ctx.save();
    this.ctx.font = this.config.baseTextSize * 0.7 + 'px bold ' + this.defaultFontFamily;
    this.ctx.fillStyle = '#4F4F4F';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.config.bookInfo.title,
      this.scaledWidth - this.scaledPadding,
      this.scaledPadding + this.offsetY + this.scaledPadding * 3,
      this.scaledWidth - this.scaledPadding * 2
    );

    this.offsetY += this.config.baseTextSize;
    this.ctx.restore();
    return Promise.resolve();
  }
  renderAuthor(): Promise<void> {
    this.ctx.save();
    this.ctx.font = this.config.baseTextSize * 0.7 + 'px bold ' + this.defaultFontFamily;
    this.ctx.fillStyle = '#4F4F4F';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.config.bookInfo.author,
      this.scaledWidth - this.scaledPadding,
      this.scaledPadding + this.offsetY + this.scaledPadding * 3,
      this.scaledWidth - this.scaledPadding * 2
    );
    this.offsetY += this.config.baseTextSize;
    this.ctx.restore();
    return Promise.resolve();
  }

  renderBanner(): Promise<void> {
    this.ctx.save();
    const ctx = this.ctx;
    const x = this.scaledPadding;
    const y = this.scaledHeight - this.bannerHeight - this.scaledPadding;
    const width = this.scaledWidth - this.scaledPadding * 2;
    const height = this.bannerHeight;
    const defaultRadius = 5;
    const radius = { tl: defaultRadius, tr: defaultRadius, br: defaultRadius, bl: defaultRadius };

    // make blur effect
    // ctx.save()
    // ctx.filter = 'blur(5px)'
    // ctx.fillStyle = 'rgba(61,126,154, .7)'
    // ctx.fillRect(x, y, width, height)
    // ctx.restore()
    // draw box
    ctx.fillStyle = 'rgba(0,0,0, .1)';
    // ctx.fillStyle = 'rgba(61,126,154, .7)'
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;
    ctx.fill();

    this.ctx.restore();
    return Promise.resolve();
  }

  async renderMyInfo(user?: BasicUserInfo): Promise<void> {
    if (!user) {
      return Promise.resolve();
    }

    const avatarSize = 60;
    const avatar = await this.loadImage(user.avatar);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(
      this.scaledPadding + avatarSize,
      this.scaledHeight - this.scaledPadding - this.bannerHeight / 2 - 5,
      avatarSize / 2,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.clip();
    this.ctx.drawImage(
      avatar,
      this.scaledPadding + avatarSize / 2,
      this.scaledHeight - this.scaledPadding - this.bannerHeight / 2 - avatarSize / 2 - 5,
      avatarSize,
      avatarSize
    );
    this.ctx.closePath();
    this.ctx.restore();

    this.ctx.save();
    this.ctx.font = this.config.baseTextSize * 0.7 + 'px bold' + this.defaultFontFamily;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      user.name,
      this.scaledPadding * 2,
      this.scaledHeight - this.scaledPadding * 2,
      this.scaledWidth - this.scaledPadding * 2.5 - this.qrcodeSize
    );

    this.ctx.restore();
    return Promise.resolve();
  }

  async renderQRCode(): Promise<void> {
    const qrcode = await FetchQRCode(`c=${this.config.clipping.id}`, 'pages/landing/landing', this.qrcodeSize, true);
    this.ctx.save();
    await this.ctx.drawImage(
      qrcode,
      this.scaledWidth - (this.qrcodeSize + this.config.padding + this.bannerGap),
      this.scaledHeight - (this.qrcodeSize + this.scaledPadding + this.bannerGap),
      this.qrcodeSize,
      this.qrcodeSize
    );

    this.ctx.restore();
    return Promise.resolve();
  }
}
