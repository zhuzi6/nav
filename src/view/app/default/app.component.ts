// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See https://github.com/xjh22222228/nav

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommonService } from 'src/services/common'
import { SearchComponent } from 'src/components/search/index.component'
import { CardComponent } from 'src/components/card/index.component'
import { FooterComponent } from 'src/components/footer/footer.component'

@Component({
  standalone: true,
  imports: [CommonModule, SearchComponent, CardComponent, FooterComponent],
  selector: 'app-home',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export default class WebpComponent {
  open: boolean = false

  constructor(public commonService: CommonService) {}

  handleCilckNav(id: number) {
    this.commonService.handleClickClass(id)
    this.handleToggleOpen()
  }

  handleToggleOpen() {
    this.open = !this.open
  }
}
