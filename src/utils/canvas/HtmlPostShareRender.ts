import type { IPostShareRender } from './mp-render'
import { PostShareRender } from './PostShareRender'

export class HtmlPostShareRender
  extends PostShareRender
  implements IPostShareRender
{
  setup() {
    const ctx = this.dom.getContext('2d')
    this.dom.width = this.config.width * this.config.dpr
    this.dom.height = this.config.height * this.config.dpr
    ctx?.scale(this.config.dpr, this.config.dpr)
  }
  async saveToLocal() {
    const base64Data = this.dom.toDataURL('image/png')
    return base64Data
    // const res = await Taro.canvasToTempFilePath({
    //   x: 0,
    //   y: 0,
    //   width: this.config.width,
    //   height: this.config.height,
    //   destHeight: this.config.height * this.config.dpr,
    //   destWidth: this.config.width * this.config.dpr,
    //   canvas: this.dom,
    //   fileType: 'jpg'
    // });

    // return Taro.saveImageToPhotosAlbum({
    //   filePath: res.tempFilePath
    // });
  }
}
