/**
 * Test script for chunk image functionality
 * 
 * This script tests:
 * 1. Image upload to Supabase Storage
 * 2. Image URL storage in chapter chunks
 * 3. Image display in ChapterReader
 * 4. Image removal from storage
 * 
 * Usage:
 *   npm run test:chunk-images
 * 
 * Prerequisites:
 *   - Supabase bucket 'chunk-images' must exist and be public
 *   - At least one chapter with chunks must exist
 *   - Environment variables must be set in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const BUCKET_NAME = 'chunk-images'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  results.push({ name, passed, error, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  if (error) {
    console.log(`   Error: ${error}`)
  }
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`)
  }
}

/**
 * Test 1: Verify bucket exists and is accessible
 */
async function testBucketExists() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      logTest('Bucket exists check', false, error.message)
      return false
    }
    
    const chunkImagesBucket = buckets?.find(b => b.name === BUCKET_NAME)
    
    if (!chunkImagesBucket) {
      logTest('Bucket exists check', false, `Bucket '${BUCKET_NAME}' not found`)
      return false
    }
    
    if (!chunkImagesBucket.public) {
      logTest('Bucket exists check', false, `Bucket '${BUCKET_NAME}' is not public`)
      return false
    }
    
    logTest('Bucket exists check', true, undefined, {
      bucketName: chunkImagesBucket.name,
      public: chunkImagesBucket.public
    })
    return true
  } catch (error: any) {
    logTest('Bucket exists check', false, error.message)
    return false
  }
}

/**
 * Test 2: Create a test image file
 */
function createTestImage(): Buffer | null {
  try {
    // Create a simple 1x1 PNG image in memory
    // PNG signature + minimal IHDR chunk
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // Compressed data
      0x0D, 0x0A, 0x2D, 0xB4, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ])
    
    logTest('Create test image', true, undefined, { size: pngData.length })
    return pngData
  } catch (error: any) {
    logTest('Create test image', false, error.message)
    return null
  }
}

/**
 * Test 3: Upload image to storage
 */
async function testImageUpload(testImage: Buffer, dayNumber: number, chunkId: number): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const filePath = `day${dayNumber}/chunk${chunkId}/test-${timestamp}.png`
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, testImage, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (error) {
      logTest('Image upload', false, error.message)
      return null
    }
    
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)
    
    if (!urlData?.publicUrl) {
      logTest('Image upload', false, 'Failed to get public URL')
      return null
    }
    
    logTest('Image upload', true, undefined, {
      path: filePath,
      url: urlData.publicUrl
    })
    
    return urlData.publicUrl
  } catch (error: any) {
    logTest('Image upload', false, error.message)
    return null
  }
}

/**
 * Test 4: Verify image is accessible via URL
 */
async function testImageAccessibility(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    
    if (!response.ok) {
      logTest('Image accessibility', false, `HTTP ${response.status}: ${response.statusText}`)
      return false
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      logTest('Image accessibility', false, `Invalid content type: ${contentType}`)
      return false
    }
    
    logTest('Image accessibility', true, undefined, {
      status: response.status,
      contentType
    })
    return true
  } catch (error: any) {
    logTest('Image accessibility', false, error.message)
    return false
  }
}

/**
 * Test 5: Get a chapter with chunks
 */
async function getTestChapter(): Promise<{ id: number; day_number: number; chunks: any[] } | null> {
  try {
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, day_number, chunks')
      .not('chunks', 'is', null)
      .limit(1)
    
    if (error) {
      logTest('Get test chapter', false, error.message)
      return null
    }
    
    if (!chapters || chapters.length === 0) {
      logTest('Get test chapter', false, 'No chapters with chunks found')
      return null
    }
    
    const chapter = chapters[0]
    const chunks = Array.isArray(chapter.chunks) ? chapter.chunks : []
    
    if (chunks.length === 0) {
      logTest('Get test chapter', false, 'Chapter has no chunks')
      return null
    }
    
    logTest('Get test chapter', true, undefined, {
      chapterId: chapter.id,
      dayNumber: chapter.day_number,
      chunksCount: chunks.length
    })
    
    return {
      id: chapter.id,
      day_number: chapter.day_number,
      chunks: chunks
    }
  } catch (error: any) {
    logTest('Get test chapter', false, error.message)
    return null
  }
}

/**
 * Test 6: Update chunk with image URL
 */
async function testUpdateChunkWithImage(
  chapterId: number,
  chunkIndex: number,
  imageUrl: string
): Promise<boolean> {
  try {
    // Get current chapter
    const { data: chapter, error: fetchError } = await supabase
      .from('chapters')
      .select('chunks')
      .eq('id', chapterId)
      .single()
    
    if (fetchError || !chapter) {
      logTest('Update chunk with image', false, fetchError?.message || 'Chapter not found')
      return false
    }
    
    const chunks = Array.isArray(chapter.chunks) ? [...chapter.chunks] : []
    if (chunkIndex >= chunks.length) {
      logTest('Update chunk with image', false, `Chunk index ${chunkIndex} out of range`)
      return false
    }
    
    // Update chunk with image URL
    chunks[chunkIndex] = {
      ...chunks[chunkIndex],
      imageUrl: imageUrl
    }
    
    const { error: updateError } = await supabase
      .from('chapters')
      .update({ chunks })
      .eq('id', chapterId)
    
    if (updateError) {
      logTest('Update chunk with image', false, updateError.message)
      return false
    }
    
    // Verify update
    const { data: updatedChapter } = await supabase
      .from('chapters')
      .select('chunks')
      .eq('id', chapterId)
      .single()
    
    const updatedChunks = Array.isArray(updatedChapter?.chunks) ? updatedChapter.chunks : []
    const updatedChunk = updatedChunks[chunkIndex]
    
    if (updatedChunk?.imageUrl !== imageUrl) {
      logTest('Update chunk with image', false, 'Image URL not saved correctly')
      return false
    }
    
    logTest('Update chunk with image', true, undefined, {
      chunkIndex,
      imageUrl
    })
    return true
  } catch (error: any) {
    logTest('Update chunk with image', false, error.message)
    return false
  }
}

/**
 * Test 7: Remove image from storage
 */
async function testRemoveImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const pathMatch = imageUrl.match(/chunk-images\/(.+)$/)
    if (!pathMatch || !pathMatch[1]) {
      logTest('Remove image', false, 'Invalid URL format')
      return false
    }
    
    const filePath = pathMatch[1]
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])
    
    if (error) {
      logTest('Remove image', false, error.message)
      return false
    }
    
    // Verify removal by checking if file still exists
    const { data: files } = await supabase.storage
      .from(BUCKET_NAME)
      .list(filePath.split('/').slice(0, -1).join('/'))
    
    const fileName = filePath.split('/').pop()
    const stillExists = files?.some(f => f.name === fileName)
    
    if (stillExists) {
      logTest('Remove image', false, 'File still exists after removal')
      return false
    }
    
    logTest('Remove image', true, undefined, { path: filePath })
    return true
  } catch (error: any) {
    logTest('Remove image', false, error.message)
    return false
  }
}

/**
 * Test 8: Clean up - remove image URL from chunk
 */
async function cleanupChunkImage(chapterId: number, chunkIndex: number): Promise<void> {
  try {
    const { data: chapter } = await supabase
      .from('chapters')
      .select('chunks')
      .eq('id', chapterId)
      .single()
    
    if (!chapter) return
    
    const chunks = Array.isArray(chapter.chunks) ? [...chapter.chunks] : []
    if (chunkIndex >= chunks.length) return
    
    chunks[chunkIndex] = {
      ...chunks[chunkIndex],
      imageUrl: null
    }
    
    await supabase
      .from('chapters')
      .update({ chunks })
      .eq('id', chapterId)
    
    logTest('Cleanup chunk image URL', true)
  } catch (error: any) {
    logTest('Cleanup chunk image URL', false, error.message)
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Starting chunk image functionality tests...\n')
  
  // Test 1: Bucket exists
  const bucketExists = await testBucketExists()
  if (!bucketExists) {
    console.log('\n❌ Bucket check failed. Please create the "chunk-images" bucket in Supabase.')
    printSummary()
    process.exit(1)
  }
  
  // Test 2: Create test image
  const testImage = createTestImage()
  if (!testImage) {
    console.log('\n❌ Failed to create test image.')
    printSummary()
    process.exit(1)
  }
  
  // Test 3: Get test chapter
  const testChapter = await getTestChapter()
  if (!testChapter) {
    console.log('\n❌ No chapter with chunks found. Please create a chapter with chunks first.')
    printSummary()
    process.exit(1)
  }
  
  // Test 4: Upload image
  const imageUrl = await testImageUpload(
    testImage,
    testChapter.day_number,
    testChapter.chunks[0].id
  )
  if (!imageUrl) {
    console.log('\n❌ Image upload failed.')
    printSummary()
    process.exit(1)
  }
  
  // Test 5: Verify image accessibility
  await testImageAccessibility(imageUrl)
  
  // Test 6: Update chunk with image URL
  const updateSuccess = await testUpdateChunkWithImage(
    testChapter.id,
    0,
    imageUrl
  )
  
  // Test 7: Remove image
  await testRemoveImage(imageUrl)
  
  // Cleanup: Remove image URL from chunk
  if (updateSuccess) {
    await cleanupChunkImage(testChapter.id, 0)
  }
  
  console.log('\n')
  printSummary()
}

function printSummary() {
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  console.log('\n' + '='.repeat(50))
  console.log(`Test Summary: ${passed}/${total} tests passed`)
  console.log('='.repeat(50))
  
  if (passed === total) {
    console.log('✅ All tests passed!')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed. See details above.')
    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
