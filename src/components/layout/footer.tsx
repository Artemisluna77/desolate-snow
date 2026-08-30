const FRIEND_LINKS = [
  { label: 'Bangumi 番组计划', href: 'https://bgm.tv/' },
  { label: 'Bangumi API', href: 'https://bangumi.github.io/api/' },
]

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6 space-y-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-foreground">友情链接</span>
          {FRIEND_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p>
          本站为学习用途的界面复刻项目,不存储、不分发任何视频资源;数据来自 Bangumi
          开放 API,播放内容为公共演示视频。
        </p>
        <p>AGE动漫复刻 · {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
