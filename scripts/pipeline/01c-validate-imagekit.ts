import ImageKit from 'imagekit';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PHASE 1c: ImageKit Service Validation
 * Responsibility: Test Asset Upload + Transformation URL check.
 */

async function validateImageKit() {
  console.log('🖼️ Starting Phase 1c: ImageKit Service Validation...\n');

  const rootDir = path.resolve(__dirname, '../..');
  dotenv.config({ path: path.join(rootDir, '.env') });
  const env = process.env;

  const requiredVars = ['VITE_IMAGEKIT_PUBLIC_KEY', 'VITE_IMAGEKIT_PRIVATE_KEY', 'VITE_IMAGEKIT_URL_ENDPOINT'];
  const missingVars = requiredVars.filter(v => !env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Validation Failed: Missing Environment Variables');
    console.error(`   Expected: ${requiredVars.join(', ')}`);
    console.error(`   Missing:  ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const imagekit = new ImageKit({
    publicKey: env.VITE_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: env.VITE_IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: env.VITE_IMAGEKIT_URL_ENDPOINT || ''
  });

  const testImagePath = path.join(rootDir, 'tools/assets/test-image.jpg');

  if (!fs.existsSync(testImagePath)) {
    console.warn('   ⚠️ Test image missing. Creating default...');
    if (!fs.existsSync(path.dirname(testImagePath))) fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    fs.writeFileSync(testImagePath, 'placeholder-content-for-validation');
  }

  try {
    // 1. Upload Test
    console.log('📦 Testing Image Upload...');
    const uploadResponse = await imagekit.upload({
      file: fs.readFileSync(testImagePath),
      fileName: `validation_test_${Date.now()}.jpg`,
      folder: '/_pipeline_validation'
    });
    
    if (!uploadResponse.fileId || !uploadResponse.url) {
        throw new Error('Upload response malformed (missing fileId or url).');
    }
    console.log('   ✅ Upload successful. FileID:', uploadResponse.fileId);

    // 2. Transformation Test
    console.log('\n📦 Testing Transformation URL...');
    const transformedUrl = imagekit.url({
      src: uploadResponse.url,
      transformation: [{ height: '100', width: '100', focus: 'auto' }]
    });
    
    console.log('   🌐 Requesting:', transformedUrl);
    const response = await fetch(transformedUrl);
    
    if (!response.ok) {
        console.error('   ❌ Transformation URL Request Failed');
        console.error(`      Expected: HTTP 200`);
        console.error(`      Found:    HTTP ${response.status}`);
        throw new Error('Transformation check failed');
    }
    console.log('   ✅ Transformation alive (Status 200).');

    // 3. Cleanup
    console.log('\n📦 Cleaning up test asset...');
    await imagekit.deleteFile(uploadResponse.fileId);
    console.log('   ✅ Asset deleted.');

    console.log('\n✨ SUMMARY: ImageKit Validation PASSED');
    console.log('   - Upload: OK');
    console.log('   - Transform: OK');
    console.log('   - Cleanup: OK');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ ImageKit Validation FAILED');
    console.error(`   Error: ${error.message || error}`);
    process.exit(1);
  }
}

validateImageKit().catch(err => {
  console.error(err);
  process.exit(1);
});
