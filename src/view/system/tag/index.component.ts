// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See https://github.com/xjh22222228/nav

import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { $t } from 'src/locale'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ITagPropValues } from 'src/types'
import { updateFileContent } from 'src/api'
import { TAG_PATH } from 'src/constants'
import { tagList } from 'src/store'
import { isSelfDevelop } from 'src/utils/utils'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NzButtonModule,
    NzInputModule,
    NzTableModule,
    NzPopconfirmModule,
  ],
  providers: [NzModalService, NzMessageService],
  selector: 'system-tag',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SystemTagComponent {
  $t = $t
  isSelfDevelop = isSelfDevelop
  tagList: ITagPropValues[] = tagList
  submitting: boolean = false
  incrementId = Math.max(...tagList.map((item) => Number(item.id))) + 1

  constructor(
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit() {}

  onColorChange(e: any, idx: number) {
    const color = e.target.value
    this.tagList[idx].color = color
  }

  handleAdd() {
    const isEmpty = this.tagList.some((item) => !item.name.trim())
    if (isEmpty) {
      return
    }
    this.incrementId += 1
    this.tagList.unshift({
      id: this.incrementId,
      name: '',
      color: '#f50000',
      desc: '',
      isInner: false,
    })
  }

  handleDelete(idx: number) {
    this.tagList.splice(idx, 1)
  }

  handleSubmit() {
    if (this.submitting) {
      return
    }

    // 去重
    const o: Record<string, any> = {}
    this.tagList.forEach((item: ITagPropValues) => {
      if (item.name?.trim?.()) {
        o[item.name] = {
          ...item,
          name: undefined,
        }
      }
    })

    if (Object.keys(o).length !== this.tagList.length) {
      this.message.error($t('_repeatAdd'))
      return
    }

    this.modal.info({
      nzTitle: $t('_syncDataOut'),
      nzOkText: $t('_confirmSync'),
      nzContent: $t('_confirmSyncTip'),
      nzOnOk: () => {
        this.submitting = true
        updateFileContent({
          message: 'update tag',
          content: JSON.stringify(this.tagList),
          path: TAG_PATH,
        })
          .then(() => {
            this.message.success($t('_saveSuccess'))
          })
          .finally(() => {
            this.submitting = false
          })
      },
    })
  }

  trackByItem(i: number, item: any) {
    return item.id
  }
}
