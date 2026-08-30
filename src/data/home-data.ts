export interface HomeVideoCard {
  id: number
  title: string
  coverUrl: string
  episode: string
}

export interface HomeScheduleItem {
  id: number
  title: string
  episode: string
  isNew?: boolean
  finished?: boolean
}

export interface HomeScheduleDay {
  label: string
  items: HomeScheduleItem[]
}

export interface HomeRecentUpdate {
  id: number
  title: string
  date: string
}

/** 原站使用的封面代理地址，避免直接引用带防盗链的源图。 */
export function ageCover(id: number): string {
  const source = encodeURIComponent(`https://cdn.aqdstatic.com:966/age/covers/${id}.jpg`)
  return `https://gimg0.baidu.com/gimg/app=2001&n=0&g=0n&fmt=jpeg&src=${source}`
}

function video(id: number, title: string, episode: string): HomeVideoCard {
  return { id, title, episode, coverUrl: ageCover(id) }
}

function schedule(
  id: number,
  title: string,
  episode: string,
  options: Pick<HomeScheduleItem, 'isNew' | 'finished'> = {},
): HomeScheduleItem {
  return { id, title, episode, ...options }
}

export const HOME_RECENT: HomeVideoCard[] = [
  video(20260170, '魔法少女奈叶 EXCEEDS Gun Blaze Vengeance', '第9集'),
  video(20260222, '鬼之花嫁', '第09集'),
  video(20260187, '穹庐下的魔女', '第10集'),
  video(20260086, '黄泉使者', '第21集'),
  video(20260168, 'Grow Up Show ～向日葵马戏团～', '第09集'),
  video(20260174, '死神 千年血战篇-祸进谭-', '第06集'),
  video(20260192, '岩元前辈的推荐', '第09集'),
  video(20260195, '暗黑灯火', '第09集'),
  video(20260223, '猫与龙', '第10集'),
  video(20260097, '入间同学入魔了 第四季', '第20集'),
]

export const HOME_RECOMMEND: HomeVideoCard[] = [
  video(20150052, '枪与假面舞会', '[TV 01-12]'),
  video(20160092, 'NEW GAME!', '[TV 01-12]'),
  video(20030013, '神枪少女', '第13集(完结)'),
  video(20070045, '向阳素描', '[BD 01-12]'),
  video(20080002, '夏目友人帐', '[TV 01-13]'),
  video(20180127, '高分少女', '第12集(完结)'),
  video(20120068, 'Little Busters!', '[TV 01-26+SP01]'),
  video(20180311, '夏目友人帐剧场版 ～缘结空蝉～', '全集'),
  video(20190025, '星合之空', '[TV 01-12]'),
  video(20140054, '极黑的布伦希尔特', '第13集(完结)'),
]

export const HOME_SCHEDULE: HomeScheduleDay[] = [
  {
    label: '周一',
    items: [
      schedule(20260215, '说出你们先走我断后的十年后 我成为了传说', '第09集'),
      schedule(20260183, '碧蓝航线 微速前行 第二季', '00:45 第08集'),
      schedule(20260112, '摩绪', '12:00 第21集'),
      schedule(20260216, '最强出涸皇子的暗跃帝位争夺', '20:30 第08集'),
      schedule(20260208, '骸骨骑士大人异世界冒险中 第二季', '21:00 第08集'),
      schedule(20260189, '世界在起舞', '22:00 第09集'),
      schedule(20260227, '与奔跑在透明之夜的你，谈一场看不见的恋爱', '20:30 第08集'),
      schedule(20260217, '暴走千金立誓复仇。～用魔导书之力碾碎祖国～', '21:30 第08集'),
      schedule(20260226, '转学后班上的清纯可爱美少女 竟是小时候玩在一起的哥们', '23:00 第08集'),
      schedule(20260220, '被遗弃圣女的异世界美食之旅 用隐藏技能召唤了露营车', '22:30 第08集'),
      schedule(20260185, '斗球儿弹子', '22:00 第08集'),
      schedule(20260096, '欺诈游戏', '23:00 第21集'),
    ],
  },
  {
    label: '周二',
    items: [
      schedule(20260175, '碧蓝之海 第三季', '00:00 第07集'),
      schedule(20260201, '感谢对战 大小姐才不玩格斗游戏', '19:30 第08集'),
      schedule(20260203, '与你相恋到生命尽头', '20:30 第08集'),
      schedule(20260230, '拯救替身千金的是冷酷无情冰之王子的爱', '20:55 第08集'),
      schedule(20260221, '无自觉圣女今天也无意识地释放力量', '21:00 第09集'),
      schedule(20250200, '怪物弹珠 DEADVERSE RELOADED', '22:00 PV'),
      schedule(20260172, '攻壳机动队 THE GHOST IN THE SHELL', '22:00 第08集'),
      schedule(20260171, '铠真传 武士军团 第2部分', '22:30 第08集'),
      schedule(20260224, '底牌很多的维多利亚', '23:00 第08集'),
    ],
  },
  {
    label: '周三',
    items: [
      schedule(20260102, '当前、正被打扰中！', '第12集(完结)', { finished: true }),
      schedule(20260188, '天是红河岸', '00:35 第08集'),
      schedule(20210240, '幼女战记 第二季', '21:30 第08集'),
      schedule(20260229, '澈底对你成瘾', '22:25 第08集'),
      schedule(20260177, '克雷瓦提斯2：魔兽之王与虚伪的勇者传承', '20:00 第08集'),
      schedule(20260219, '女主角？圣女？不，我是杂役女仆（自豪）！', '21:00 第10集'),
      schedule(20260066, 'Re：从零开始的异世界生活 第四季 丧失篇', '22:00 第14集'),
      schedule(20260198, '不虐待我的继母与继姐', '22:30 第08集'),
      schedule(20260206, '乙女游戏世界对路人角色很不友好 第二季', '23:30 第08集'),
      schedule(20260207, '乡下大叔成为剑圣 第二季', '22:45 第08集'),
      schedule(20260214, 'LV999的村民', '23:00 第10集'),
      schedule(20260186, '雷霆三人行', '23:45 第08集'),
    ],
  },
  {
    label: '周四',
    items: [
      schedule(20260163, 'Candy Caries 蛀在糖糖里', '00:00 第20集'),
      schedule(20260228, '我独自盗墓', '00:15 第08集'),
      schedule(20260180, '花样少男少女 第2季', '01:00 第10集'),
      schedule(20250076, 'MIRU 我们的未来', '01:30 PV'),
      schedule(20250139, '银河特急 银河☆地铁', 'HD中字'),
      schedule(20260193, '令和的斑小姐', '20:30 第09集'),
      schedule(20260184, '文豪野犬 汪！第二季', '20:40 第09集'),
      schedule(20250209, '元祖！BanG Dream Chan', '21:00 第47集'),
      schedule(20260169, 'BanG Dream! YUME∞MITA', '22:00 第11集'),
      schedule(20260088, '石纪元 科学与未来 第3部分', '第13集(完结)', { finished: true }),
      schedule(20260167, '梅比乌斯之尘', '22:30 第08集'),
      schedule(20260210, '落第贤者的学院无双 第二回转生，S等级作弊魔术师冒险记', '23:00 第10集'),
      schedule(20260081, '轮回的花瓣', '第13集(完结)', { finished: true }),
      schedule(20260212, '被追放的转生重骑士用游戏知识开无双', '23:56 第09集'),
    ],
  },
  {
    label: '周五',
    items: [
      schedule(20260200, '尼古喵喵', '00:00 第08集'),
      schedule(20260197, '少女怪兽焦糖味', '01:28 第09集'),
      schedule(20230073, '宝可梦 地平线', '17:55 第147集'),
      schedule(20260028, '决斗大师 LOST ～忘却的太阳～', '19:00 PV'),
      schedule(20220494, '百万吨级武藏 第二季', '21:00 第02集'),
      schedule(20260213, '从0位居民开始的边境领主大人', '21:30 第09集'),
      schedule(20260178, '擅长逃跑的殿下 第二季', '22:30 第07集'),
      schedule(20260098, '关于我转生变成史莱姆这档事 第四季', '23:00 第20集'),
      schedule(20260203, '与你相恋到生命尽头', '20:30 第08集'),
      schedule(20260101, '神之水滴', '23:30 第21集'),
    ],
  },
  {
    label: '周六',
    items: [
      schedule(20260067, '北斗神拳 -FIST OF THE NORTH STAR-', '00:00 第12集'),
      schedule(20260199, '我家的弟弟们真是让您费心了', '00:30 第09集'),
      schedule(20260194, '正后方的神威', '00:30 第08集'),
      schedule(20260209, '地狱模式 ～喜欢速通游戏的玩家在废设定异世界无双～ 第2季', '00:30 第09集'),
      schedule(20250220, 'GANGLION', '00:53 PV'),
      schedule(20240039, '影之诗F 方舟篇', '08:30 第94集'),
      schedule(20260089, '小书痴的下克上 〜为了成为图书管理员而不择手段〜 第四季', '16:30 第19集'),
      schedule(20260097, '入间同学入魔了 第四季', '18:55 第20集', { isNew: true }),
      schedule(20260205, '无职转生Ⅲ 到了异世界就拿出真本事', '23:00 第09集'),
      schedule(20000005, '名侦探柯南', '19:30 第1271集'),
      schedule(20260195, '暗黑灯火', '21:00 第09集', { isNew: true }),
      schedule(20260223, '猫与龙', '20:30 第10集', { isNew: true }),
      schedule(20260192, '岩元前辈的推荐', '21:30 第09集', { isNew: true }),
      schedule(20260174, '死神 千年血战篇-祸进谭-', '22:00 第06集', { isNew: true }),
      schedule(20260179, '柔光魔女股份有限公司 第二季', '23:55 第08集'),
    ],
  },
  {
    label: '周日',
    items: [
      schedule(20260168, 'Grow Up Show ～向日葵马戏团～', '00:00 第09集', { isNew: true }),
      schedule(20260086, '黄泉使者', '00:00 第21集', { isNew: true }),
      schedule(20260187, '穹庐下的魔女', '00:00 第10集', { isNew: true }),
      schedule(20260173, '人造人009 涅墨西斯', '00:00 已完结', { finished: true }),
      schedule(20260204, '声称不爱我的下任公爵为何会溺爱我', '00:30 第09集'),
      schedule(20260170, '魔法少女奈叶 EXCEEDS Gun Blaze Vengeance', '01:00 第9集', {
        isNew: true,
      }),
      schedule(20260090, '一叠间漫画咖啡屋生活！', '第11集(完结)', { finished: true }),
      schedule(20260196, '花织同学转生后还是想干架', '01:30 第08集'),
      schedule(20260222, '鬼之花嫁', '01:00 第09集', { isNew: true }),
      schedule(
        20260225,
        '才女的侍从 在满是高岭之花的贵族学校暗中照顾（毫无生活自理能力的）学院第一大小姐',
        '01:38 第09集',
      ),
      schedule(20260190, '炒翻天', '16:30 第09集'),
      schedule(20260141, '小鲨鱼去郊游 第二季', '06:00 PV'),
      schedule(20260235, 'PLANNOSAURUS 真古生遗物部', '第PV'),
      schedule(20260064, '名侦探光之美少女！', '07:30 第31集'),
      schedule(20250235, '数码宝贝 BEATBREAK', '08:00 第44集'),
      schedule(20230091, '逃走中 GREAT MISSION', '08:00 第70集'),
      schedule(20260115, '拜托了偶像公主', '08:30 第22集'),
      schedule(20240051, '秘密的偶像公主', '09:00 第94集'),
      schedule(20000001, '海贼王', '09:30 第1172集'),
      schedule(20260191, "Let's Go 怪奇组", '15:30 第09集'),
      schedule(20260181, '相反的你和我 第二季', '16:00 第09集'),
      schedule(20260065, '夜樱家的大作战 第二季', '第12集(完结)', { finished: true }),
      schedule(20250045, '0岁儿童开始冲刺的故事 第二季', '16:55 PV'),
      schedule(20260127, '钻石王牌 act2 第二季', '第13集(完结)', { finished: true }),
      schedule(20260211, '世界最强的后卫 ～迷宫国的新人探索者～', '21:00 第09集'),
      schedule(20260182, '超超超超超喜欢你的100个女朋友 第三季', '22:00 第8集'),
      schedule(20190015, '二十世纪电气目录', '22:00 第08集'),
      schedule(20230299, '明治击剑－1874－', '22:00 第10集'),
      schedule(20260244, '航海王 女英雄们的故事', '全集'),
      schedule(20260218, '恶女不才，请多关照 ～雏宫蝶鼠换身传～', '22:45 第07集'),
      schedule(20260083, '黑猫与魔女的教室', '23:00 第20集'),
      schedule(20260155, '航海王 埃鲁巴夫篇', 'PV'),
      schedule(20260166, '再见，拉拉', '23:30 第08集'),
    ],
  },
]

function localDate(offset: number): string {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const RECENT_TITLES = [
  [20260170, '魔法少女奈叶 EXCEEDS Gun Blaze Vengeance'],
  [20260222, '鬼之花嫁'],
  [20260187, '穹庐下的魔女'],
  [20260086, '黄泉使者'],
  [20260168, 'Grow Up Show ～向日葵马戏团～'],
  [20260174, '死神 千年血战篇-祸进谭-'],
  [20260192, '岩元前辈的推荐'],
  [20260195, '暗黑灯火'],
  [20260223, '猫与龙'],
  [20260097, '入间同学入魔了 第四季'],
  [20260245, '暗芝居 第十七季'],
  [20260247, '提欧奥特曼'],
  [20260159, '轻松熊'],
  [20230073, '宝可梦 地平线'],
  [20000005, '名侦探柯南'],
  [20260209, '地狱模式 ～喜欢速通游戏的玩家在废设定异世界无双～ 第2季'],
  [20260171, '铠真传 武士军团 第2部分'],
  [20260194, '正后方的神威'],
  [20260199, '我家的弟弟们真是让您费心了'],
  [20260202, '画完这个再去死'],
] as const

export const HOME_RECENT_UPDATES: HomeRecentUpdate[] = RECENT_TITLES.map(([id, title], index) => ({
  id,
  title,
  date: localDate(index < 5 ? 0 : -1),
}))

export const AGE_BANNER_URL = 'https://p3.toutiaoimg.com/origin/137370002e7fbe11b296a'

export const HOME_FRIEND_LINKS = [
  { label: '88影视网', href: 'https://www.88ystv.com/' },
  { label: '美果TV', href: 'https://www.mgmgtv.net/' },
  { label: '微博兔影视', href: 'https://www.wbtdy.tv/' },
  { label: '黑蚂蚁影院', href: 'https://www.91mayitv.com/' },
]
