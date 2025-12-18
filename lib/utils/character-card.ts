// SillyTavern Character Card V2 格式
export interface CharacterCardV2 {
  spec: 'chara_card_v2'
  spec_version: string
  data: {
    name: string
    description?: string
    personality?: string
    scenario?: string
    first_mes?: string
    mes_example?: string
    creator_notes?: string
    system_prompt?: string
    post_history_instructions?: string
    tags?: string[]
    creator?: string
    character_version?: string
    alternate_greetings?: string[]
    extensions?: Record<string, unknown>
  }
}

// 从PNG文件读取角色卡数据
export async function readCharacterFromPNG(file: File): Promise<CharacterCardV2 | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const data = extractPNGTextChunk(new Uint8Array(buffer), 'chara')
        if (data) {
          const json = JSON.parse(atob(data))
          resolve(json)
        } else {
          resolve(null)
        }
      } catch {
        resolve(null)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

// 从JSON文件读取角色卡数据
export async function readCharacterFromJSON(file: File): Promise<CharacterCardV2 | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        // 兼容V1和V2格式
        if (json.spec === 'chara_card_v2') {
          resolve(json)
        } else {
          // V1格式转换为V2
          resolve({
            spec: 'chara_card_v2',
            spec_version: '2.0',
            data: {
              name: json.name || json.char_name || 'Unknown',
              description: json.description || json.char_persona,
              personality: json.personality,
              scenario: json.scenario || json.world_scenario,
              first_mes: json.first_mes || json.char_greeting,
              mes_example: json.mes_example || json.example_dialogue,
              tags: json.tags,
            }
          })
        }
      } catch {
        resolve(null)
      }
    }
    reader.readAsText(file)
  })
}

// 导出角色卡为JSON
export function exportCharacterAsJSON(card: CharacterCardV2): string {
  return JSON.stringify(card, null, 2)
}

// 导出角色卡为PNG (需要一个基础图片)
export async function exportCharacterAsPNG(
  card: CharacterCardV2,
  imageDataUrl?: string
): Promise<Blob> {
  // 创建canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  if (imageDataUrl) {
    // 使用提供的图片
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = imageDataUrl
    })
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  } else {
    // 创建默认图片
    canvas.width = 400
    canvas.height = 600
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 400, 600)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(card.data.name.charAt(0), 200, 320)
  }

  // 获取PNG数据
  const pngBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })

  // 添加角色数据到PNG
  const pngBuffer = await pngBlob.arrayBuffer()
  const pngWithData = insertPNGTextChunk(
    new Uint8Array(pngBuffer),
    'chara',
    btoa(JSON.stringify(card))
  )

  // Convert Uint8Array to ArrayBuffer properly
  const arrayBuffer = pngWithData.buffer.slice(
    pngWithData.byteOffset,
    pngWithData.byteOffset + pngWithData.byteLength
  ) as ArrayBuffer
  return new Blob([arrayBuffer], { type: 'image/png' })
}

// PNG tEXt chunk 读取
function extractPNGTextChunk(data: Uint8Array, keyword: string): string | null {
  // PNG signature: 8 bytes
  let offset = 8

  while (offset < data.length) {
    // Chunk length (4 bytes, big-endian)
    const length = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]
    offset += 4

    // Chunk type (4 bytes)
    const type = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3])
    offset += 4

    if (type === 'tEXt') {
      // 读取keyword
      let keyEnd = offset
      while (data[keyEnd] !== 0 && keyEnd < offset + length) keyEnd++
      const key = String.fromCharCode(...Array.from(data.slice(offset, keyEnd)))

      if (key === keyword) {
        // 读取value (keyword后面跟着null字节，然后是value)
        const valueStart = keyEnd + 1
        const valueEnd = offset + length
        const value = String.fromCharCode(...Array.from(data.slice(valueStart, valueEnd)))
        return value
      }
    }

    // 跳过chunk data + CRC (4 bytes)
    offset += length + 4

    if (type === 'IEND') break
  }

  return null
}

// PNG tEXt chunk 写入
function insertPNGTextChunk(data: Uint8Array, keyword: string, value: string): Uint8Array {
  // 找到IEND chunk位置
  let iendOffset = -1
  let offset = 8

  while (offset < data.length) {
    const length = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]
    const type = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7])

    if (type === 'IEND') {
      iendOffset = offset
      break
    }

    offset += 12 + length // 4 length + 4 type + length data + 4 CRC
  }

  if (iendOffset === -1) return data

  // 创建tEXt chunk
  const keywordBytes = new TextEncoder().encode(keyword)
  const valueBytes = new TextEncoder().encode(value)
  const chunkData = new Uint8Array(keywordBytes.length + 1 + valueBytes.length)
  chunkData.set(keywordBytes, 0)
  chunkData[keywordBytes.length] = 0 // null separator
  chunkData.set(valueBytes, keywordBytes.length + 1)

  const chunkLength = chunkData.length
  const chunkType = new TextEncoder().encode('tEXt')

  // 计算CRC
  const crcData = new Uint8Array(4 + chunkData.length)
  crcData.set(chunkType, 0)
  crcData.set(chunkData, 4)
  const crc = calculateCRC(crcData)

  // 构建完整chunk
  const chunk = new Uint8Array(12 + chunkData.length)
  chunk[0] = (chunkLength >> 24) & 0xff
  chunk[1] = (chunkLength >> 16) & 0xff
  chunk[2] = (chunkLength >> 8) & 0xff
  chunk[3] = chunkLength & 0xff
  chunk.set(chunkType, 4)
  chunk.set(chunkData, 8)
  chunk[8 + chunkData.length] = (crc >> 24) & 0xff
  chunk[9 + chunkData.length] = (crc >> 16) & 0xff
  chunk[10 + chunkData.length] = (crc >> 8) & 0xff
  chunk[11 + chunkData.length] = crc & 0xff

  // 插入到IEND之前
  const result = new Uint8Array(data.length + chunk.length)
  result.set(data.slice(0, iendOffset), 0)
  result.set(chunk, iendOffset)
  result.set(data.slice(iendOffset), iendOffset + chunk.length)

  return result
}

// CRC32计算
function calculateCRC(data: Uint8Array): number {
  let crc = 0xffffffff
  const table = getCRCTable()

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

let crcTable: number[] | null = null
function getCRCTable(): number[] {
  if (crcTable) return crcTable

  crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crcTable[n] = c
  }
  return crcTable
}
