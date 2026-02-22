/**
 * SCRIPT: 02-validate-imagekit-health.ts
 * 
 * AUFGABE: 
 * Funktionale Prüfung von ImageKit durch Upload, Transformation und Cleanup.
 * Optimiert für maximale Transparenz im Debug-Log.
 */

import ImageKit from 'imagekit';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LogService } from '../utils/log-service';

LogService.init('HEALTH', 'IMAGEKIT');

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function validateImageKit() {
    console.log('🖼️  STARTING FUNCTIONAL VALIDATION...');
    
    const env = process.env;
    const requiredVars = ['VITE_IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_PRIVATE_KEY', 'VITE_IMAGEKIT_URL_ENDPOINT'];
    const missingVars = requiredVars.filter(v => !env[v]);

    if (missingVars.length > 0) {
        console.error('   ❌ ERROR: Missing ImageKit credentials:', missingVars.join(', '));
        process.exit(1);
    }

    const imagekit = new ImageKit({
        publicKey: env.VITE_IMAGEKIT_PUBLIC_KEY!,
        privateKey: env.IMAGEKIT_PRIVATE_KEY!,
        urlEndpoint: env.VITE_IMAGEKIT_URL_ENDPOINT!
    });

    const testImagePath = path.join(rootDir, 'tools/assets/test-image.jpg');

    if (!fs.existsSync(testImagePath)) {
        console.error(`   ❌ ERROR: Test asset not found at ${testImagePath}`);
        process.exit(1);
    }

    try {
        // 1. Upload Test
        console.log(`   📦 UPLOAD: Sending ${testImagePath} to /_pipeline_v2_validation...`);
        const uploadResponse = await imagekit.upload({
            file: fs.readFileSync(testImagePath),
            fileName: `v2_health_test_${Date.now()}.jpg`,
            folder: '/_pipeline_v2_validation'
        });
        
        if (!uploadResponse.fileId || !uploadResponse.url) {
            throw new Error('Upload response malformed (missing fileId or url).');
        }
        console.log(`   ✅ SUCCESS: Asset uploaded. FileID: ${uploadResponse.fileId}`);

        // 2. Transformation Test
        console.log('   🌐 [IMAGEKIT] CDN: Verifying transformation endpoint...');
        const transformedUrl = imagekit.url({
            src: uploadResponse.url,
            transformation: [{ height: '100', width: '100', blur: '10' }]
        });
        
        console.log(`      Requesting: ${transformedUrl}`);
        const response = await fetch(transformedUrl);
        
        if (!response.ok) {
            console.error(`   ❌ FAIL: Transformation endpoint returned HTTP ${response.status}`);
            throw new Error('Transformation check failed');
        }
        console.log(`   ✅ SUCCESS: CDN responded with HTTP ${response.status} (Transformed Asset Alive).`);

        // 3. Cleanup
        console.log(`   🧹 [IMAGEKIT] CLEANUP: Deleting test asset ${uploadResponse.fileId}...`);
        await imagekit.deleteFile(uploadResponse.fileId);
        console.log('   ✅ SUCCESS: Test asset removed from ImageKit.');

        console.log('\n✨ IMAGEKIT VALIDATION: COMPLETE & FUNCTIONAL');
        process.exit(0);

    } catch (error: any) {
        console.error('\n   ❌ IMAGEKIT VALIDATION: FAILED');
        console.error(`      Context: ${error.message || error}`);
        process.exit(1);
    }
}

validateImageKit();
