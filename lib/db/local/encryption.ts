// 本地数据加密模块
// 使用 Web Crypto API 进行 AES-GCM 加密

const ENCRYPTION_KEY_NAME = 'aichat-libre-encryption-key'
const ENCRYPTION_SALT = 'aichat-libre-salt-v1'

// 从密码派生加密密钥
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  const saltData = encoder.encode(ENCRYPTION_SALT)

  // 导入密码作为原始密钥
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  // 使用 PBKDF2 派生 AES 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// 加密数据
export async function encryptData(data: string, password: string): Promise<string> {
  const key = await deriveKey(password)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  // 生成随机 IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // 加密
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  )

  // 组合 IV + 加密数据
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  // 转换为 Base64
  return btoa(String.fromCharCode.apply(null, Array.from(combined)))
}

// 解密数据
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const key = await deriveKey(password)

  // 从 Base64 解码
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  )

  // 提取 IV 和加密数据
  const iv = combined.slice(0, 12)
  const encryptedBuffer = combined.slice(12)

  // 解密
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// 验证密码是否正确
export async function verifyPassword(password: string): Promise<boolean> {
  const storedVerifier = localStorage.getItem(ENCRYPTION_KEY_NAME + '-verifier')
  if (!storedVerifier) return false

  try {
    const decrypted = await decryptData(storedVerifier, password)
    return decrypted === 'aichat-libre-verified'
  } catch {
    return false
  }
}

// 设置加密密码
export async function setEncryptionPassword(password: string): Promise<void> {
  const verifier = await encryptData('aichat-libre-verified', password)
  localStorage.setItem(ENCRYPTION_KEY_NAME + '-verifier', verifier)
  localStorage.setItem(ENCRYPTION_KEY_NAME + '-enabled', 'true')
}

// 移除加密密码
export function removeEncryptionPassword(): void {
  localStorage.removeItem(ENCRYPTION_KEY_NAME + '-verifier')
  localStorage.removeItem(ENCRYPTION_KEY_NAME + '-enabled')
}

// 检查是否启用了加密
export function isEncryptionEnabled(): boolean {
  return localStorage.getItem(ENCRYPTION_KEY_NAME + '-enabled') === 'true'
}

// 加密导出数据
export async function encryptExportData(jsonData: string, password: string): Promise<string> {
  const encrypted = await encryptData(jsonData, password)
  return JSON.stringify({
    version: '1.0.0',
    encrypted: true,
    data: encrypted
  })
}

// 解密导入数据
export async function decryptImportData(encryptedJson: string, password: string): Promise<string> {
  const parsed = JSON.parse(encryptedJson)

  if (!parsed.encrypted) {
    // 未加密数据，直接返回
    return encryptedJson
  }

  const decrypted = await decryptData(parsed.data, password)
  return decrypted
}

// 检查导入数据是否加密
export function isImportDataEncrypted(data: string): boolean {
  try {
    const parsed = JSON.parse(data)
    return parsed.encrypted === true
  } catch {
    return false
  }
}

// 加密 API 密钥（用于本地存储的敏感数据）
export async function encryptApiKey(apiKey: string, sessionKey: string): Promise<string> {
  return encryptData(apiKey, sessionKey)
}

// 解密 API 密钥
export async function decryptApiKey(encryptedKey: string, sessionKey: string): Promise<string> {
  return decryptData(encryptedKey, sessionKey)
}

// 生成会话密钥（基于浏览器指纹）
export function generateSessionKey(): string {
  const ua = navigator.userAgent
  const lang = navigator.language
  const platform = navigator.platform
  const screenRes = `${screen.width}x${screen.height}`

  return `${ua}-${lang}-${platform}-${screenRes}`
}
