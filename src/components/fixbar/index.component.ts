// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See https://github.com/xjh22222228/nav

import { Component, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { isDark as isDarkFn, randomBgImg, queryString } from 'src/utils'
import { NzModalService } from 'ng-zorro-antd/modal'
import { NzMessageService } from 'ng-zorro-antd/message'
import { isLogin } from 'src/utils/user'
import { updateFileContent } from 'src/api'
import { websiteList, settings } from 'src/store'
import { DB_PATH, STORAGE_KEY_MAP } from 'src/constants'
import { Router, ActivatedRoute } from '@angular/router'
import { $t, getLocale } from 'src/locale'
import { addDark, removeDark } from 'src/utils/utils'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import mitt from 'src/utils/mitt'

@Component({
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzToolTipModule],
  selector: 'app-fixbar',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  providers: [NzModalService, NzMessageService],
})
export class FixbarComponent {
  @Input() showTop: boolean = true
  @Input() showCollapse: boolean = true
  @Input() collapsed: boolean = false
  @Input() selector: string = ''
  @Output() onCollapse = new EventEmitter()

  $t = $t
  settings = settings
  language = getLocale()
  websiteList = websiteList
  isDark: boolean = isDarkFn()
  syncLoading = false
  isLogin = isLogin
  isShowFace = true
  open = localStorage.getItem(STORAGE_KEY_MAP.fixbarOpen) === 'true'
  themeList = [
    {
      name: $t('_switchTo') + ' Super',
      url: '/super',
    },
    {
      name: $t('_switchTo') + ' Light',
      url: '/light',
    },
    {
      name: $t('_switchTo') + ' Sim',
      url: '/sim',
    },
    {
      name: $t('_switchTo') + ' Side',
      url: '/side',
    },
    {
      name: $t('_switchTo') + ' Shortcut',
      url: '/shortcut',
    },
    {
      name: $t('_switchTo') + ' App',
      url: '/app',
    },
  ]

  constructor(
    private message: NzMessageService,
    private modal: NzModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    if (this.isDark) {
      addDark()
    }

    const url = this.router.url.split('?')[0]
    const defaultTheme = settings.theme?.toLowerCase?.()
    this.themeList = this.themeList
      .map((item) => {
        if (item.url === '/' + defaultTheme) {
          item.url = '/'
        }
        return item
      })
      .filter((t) => {
        if (url === '/' && url + settings.theme?.toLowerCase?.() === t.url) {
          return false
        }
        if (t.url === '/' && url === t.url + settings.theme?.toLowerCase?.()) {
          return false
        }
        return t.url !== url
      })

    if (!isLogin) {
      const isShowFace =
        [settings.showLanguage, settings.showThemeToggle].filter(Boolean)
          .length === 0
      if (isShowFace) {
        this.open = true
        this.isShowFace = false
      }
    }
  }

  ngOnInit() {}

  toggleTheme(theme: any) {
    this.router.navigate([theme.url], {
      queryParams: {
        ...queryString(),
        _: Date.now(),
      },
    })
    this.removeBackground()
  }

  goTop() {
    if (this.selector) {
      const el = document.querySelector(this.selector)
      if (el) {
        el.scrollTop = 0
      }
      return
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  collapse() {
    this.onCollapse.emit()
  }

  removeBackground() {
    const el = document.getElementById('random-light-bg')
    el?.parentNode?.removeChild?.(el)
  }

  toggleMode() {
    this.isDark = !this.isDark
    mitt.emit('EVENT_DARK', this.isDark)
    window.localStorage.setItem(
      STORAGE_KEY_MAP.isDark,
      String(Number(this.isDark))
    )

    if (this.isDark) {
      addDark()
      this.removeBackground()
    } else {
      removeDark()
      const { data } = this.activatedRoute.snapshot
      data['renderLinear'] && randomBgImg()
    }
  }

  goSystemPage() {
    this.router.navigate(['system'])
  }

  handleOpen() {
    this.open = !this.open
    localStorage.setItem(STORAGE_KEY_MAP.fixbarOpen, String(this.open))
  }

  handleSync() {
    if (this.syncLoading) {
      this.message.warning($t('_repeatOper'))
      return
    }

    this.modal.info({
      nzTitle: $t('_syncDataOut'),
      nzOkText: $t('_confirmSync'),
      nzContent: $t('_confirmSyncTip'),
      nzOnOk: () => {
        this.syncLoading = true

        updateFileContent({
          message: 'update db',
          content: JSON.stringify(this.websiteList),
          path: DB_PATH,
        })
          .then(() => {
            this.message.success($t('_syncSuccessTip'))
          })
          .finally(() => {
            this.syncLoading = false
          })
      },
    })
  }

  toggleLocale() {
    const l = this.language === 'en' ? 'zh-CN' : 'en'
    window.localStorage.setItem(STORAGE_KEY_MAP.language, l)
    window.location.reload()
  }
}
