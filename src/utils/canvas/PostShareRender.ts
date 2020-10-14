import { FetchQRCode } from '../../services/mp'
import { PostShareConfig, BasicUserInfo } from './mp-render';
import { BaseCanvasRender } from "./BaseCanvasRender";
import { UserContent } from '../../store/user/type';

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
      img.crossOrigin = "anonymous"
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
    this.ctx.save()
    const clippingContent = this.config.clipping.content.replace(/\[\d*\]/, '')
    const y = this.drawText(
      clippingContent,
      this.scaledPadding,
      this.scaledPadding * 2,
      this.scaledWidth - this.scaledPadding * 2,
      this.config.baseTextSize * 1.5
    )

    this.offsetY = y;
    this.ctx.restore();
    return Promise.resolve();
  }
  renderTitle(): Promise<void> {
    this.ctx.save();
    this.ctx.font = this.config.baseTextSize * 0.7 + 'px bold ' + this.renderFont
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
    this.ctx.font = this.config.baseTextSize * 0.7 + 'px bold ' + this.renderFont;
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

    const y = this.offsetY + 200

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
    this.offsetY = y + this.bannerHeight + this.scaledPadding
    return Promise.resolve();
  }

  async renderMyInfo(user?: BasicUserInfo): Promise<void> {
    if (!user) {
      return Promise.resolve();
    }

    const avatarSize = 65;
    const avatar = await this.loadImage(user.avatar);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(
      this.scaledPadding + avatarSize,
      this.offsetY - this.scaledPadding - this.bannerHeight / 2 - 5,
      avatarSize / 2,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.clip();
    this.ctx.drawImage(
      avatar,
      this.scaledPadding + avatarSize / 2,
      this.offsetY - this.scaledPadding - this.bannerHeight / 2 - avatarSize / 2 - 5,
      avatarSize,
      avatarSize
    );
    this.ctx.closePath();
    this.ctx.restore();

    this.ctx.save();
    this.ctx.font = this.config.baseTextSize * 0.6 + 'px bold' + this.defaultFontFamily;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const username = user.name
    let realUsername = ''

    for (let i = 0; i < username.length; i++) {
      const m = this.ctx.measureText(realUsername + username[i])
      if (m.width > avatarSize) {
        break
      }
      realUsername += username[i]
    }
    this.ctx.fillText(
      realUsername,
      this.scaledPadding * 2 + avatarSize / 2 + 7.5,
      this.offsetY - this.scaledPadding * 2,
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
      this.offsetY - (this.qrcodeSize + this.scaledPadding + this.bannerGap),
      this.qrcodeSize,
      this.qrcodeSize
    );

    this.ctx.restore();
    return Promise.resolve();
  }

  async draw(user?: BasicUserInfo): Promise<void> {
    await this.renderBackground()
    await this.renderText()
    await this.renderTitle()
    await this.renderAuthor()
    await this.renderBanner()
    await this.renderMyInfo(user)
    await this.renderQRCode()
    await this.resizePosterHeight()
  }

  async resizePosterHeight(): Promise<void> {
    this.dom.height = this.offsetY * this.config.dpr
    this.ctx?.scale(this.config.dpr, this.config.dpr)
  }

  get renderedHeight(): number {
    return this.offsetY
  }
}
