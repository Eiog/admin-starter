import { createRouter, defineEventHandler, readValidatedBody } from 'h3'
import { object, string } from 'zod'
import { paramsError, sign } from '../utils'

const READ = 0b1000 // 可读
const WRITE = 0b0100 // 可写
const CREATE = 0b0010 // 创建
const DELETE = 0b0001 // 删除
const routes = [
  { path: '/', name: '首页' },
]
const permissionStr = (permission: number) => `0b${permission.toString(2)}`

const router = createRouter()
export const loginRouter = router

router.post('/login', defineEventHandler(async (handler) => {
  const body = await readValidatedBody(handler, object({
    username: string({ required_error: '缺少账号名称' }),
    password: string({ required_error: '缺少密码' }),
  }).safeParse)
  if (!body.success) {
    throw paramsError(body)
  }
  const { username, password } = body.data
  if (username === 'admin' && password === 'admin') {
    return {
      code: 0,
      msg: '验证成功',
      token: sign({ _id: username }),
    }
  }
  return {
    code: 1,
    msg: '验证失败',
    token: '',
  }
}))
router.post('/status', defineEventHandler(async (handler) => {
  const body = await readValidatedBody(handler, object({
    token: string({ required_error: '缺少Token' }),
  }).safeParse)
  if (!body.success) {
    throw paramsError(body)
  }
  return {
    status: 'ok',
    code: 1,
    token: body.data.token,
    routes: routes.map((m) => {
      return {
        path: m.path,
        name: m.name,
        permission: READ | WRITE | CREATE | DELETE,
        permissionStr: permissionStr(READ | WRITE | CREATE | DELETE),
      }
    }),
  }
}))