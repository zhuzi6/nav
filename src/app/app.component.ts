// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See https://github.com/xjh22222228/nav

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
} from '@angular/router'
import { queryString, setLocation, isMobile, getDefaultTheme } from '../utils'
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n'
import { getLocale } from 'src/locale'
import { settings } from 'src/store'
import { verifyToken, getContentes, getUserCollectCount } from 'src/api'
import { getToken, userLogout, isLogin, getPermissions } from 'src/utils/user'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { getWebs } from 'src/utils/web'
import { isSelfDevelop } from 'src/utils/utils'
import { routes } from './app.routes'
import { MoveWebComponent } from 'src/components/move-web/index.component'
import { CreateWebComponent } from 'src/components/create-web/index.component'
import { IconGitComponent } from 'src/components/icon-git/icon-git.component'
import { EditClassComponent } from 'src/components/edit-class/index.component'
import { $t } from 'src/locale'
import event from 'src/utils/mitt'

@Component({
  standalone: true,
  imports: [
    EditClassComponent,
    NzSpinModule,
    IconGitComponent,
    RouterOutlet,
    CommonModule,
    MoveWebComponent,
    CreateWebComponent,
  ],
  selector: 'app-xiejiahe',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLogin: boolean = isLogin
  fetchIng = true

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18n: NzI18nService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {
    this.registerEvents()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateDocumentTitle()
      }
    })
  }

  private registerEvents() {
    event.on('MESSAGE', (props: any) => {
      // @ts-ignore
      this.message[props.type](props.content)
    })

    event.on('NOTIFICATION', (props: any) => {
      this.notification.create(
        props.type,
        props.title,
        props.content,
        props.config
      )
    })
  }

  private updateDocumentTitle() {
    const url = this.router.url.split('?')[0].slice(1)
    const theme = (url === '' ? settings.theme : url).toLowerCase()
    const title = settings[`${theme}DocTitle`]
    document.title = title || window.__TITLE__ || settings.title
  }

  ngOnInit() {
    this.goRoute()
    this.activatedRoute.queryParams.subscribe(setLocation)
    this.setLocale()
    this.verifyToken()
    this.getWebs()
    this.getCollectCount()
  }

  private getWebs() {
    if (isSelfDevelop) {
      getContentes().then(() => {
        setTimeout(() => {
          const currentRoutes = this.router.config
          const defaultTheme = getDefaultTheme().toLowerCase()
          const hasDefault = routes.find(
            (item: any) => item.path === defaultTheme
          )
          const isHome = this.router.url.split('?')[0] === '/'
          if (hasDefault) {
            this.router.resetConfig([
              ...currentRoutes,
              {
                ...hasDefault,
                path: '**',
              },
            ])
          }
          if (isHome) {
            this.router.navigate([defaultTheme])
          }
          this.updateDocumentTitle()
          this.fetchIng = false
          event.emit('WEB_FINISH')
          window.__FINISHED__ = true
        }, 100)
      })
    } else {
      getWebs().finally(() => {
        this.fetchIng = false
      })
    }
  }

  private setLocale() {
    if (getLocale() === 'zh-CN') {
      this.i18n.setLocale(zh_CN)
    } else {
      this.i18n.setLocale(en_US)
    }
  }

  private verifyToken() {
    const token = getToken()
    if (token) {
      verifyToken(token)
        .then((res) => {
          const data = res.data || {}
          if (!settings.email && data.email) {
            settings.email = data.email
          }
          event.emit('GITHUB_USER_INFO', data)
        })
        .catch((e: any) => {
          if (e.code !== 'ERR_NETWORK') {
            userLogout()
            setTimeout(() => {
              location.reload()
            }, 1000)
          }
        })
    }
  }

  private getCollectCount() {
    if (isLogin && getPermissions(settings).ok) {
      getUserCollectCount().then((res) => {
        const count = res.data.count
        if (count > 0) {
          this.notification.info(
            $t('_colTitle', { count }),
            $t('_collectTip'),
            {
              nzDuration: 0,
            }
          )
        }
      })
    }
  }

  private goRoute() {
    // is App
    if (settings.appTheme !== 'Current' && isMobile()) {
      const url = (this.router.url.split('?')[0] || '').toLowerCase()
      const { id, q } = queryString()
      const queryParams = { id, q }
      const path = '/' + String(settings.appTheme).toLowerCase()

      if (!url.includes(path)) {
        this.router.navigate([path], { queryParams })
      }
    }
  }
}
