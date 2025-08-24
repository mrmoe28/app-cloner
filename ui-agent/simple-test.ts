#!/usr/bin/env node

import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

async function simpleUITest() {
  console.log('🚀 Starting simple UI test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test basic functionality
    console.log('📱 Testing navigation...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await fs.mkdir('./ui-agent/output', { recursive: true });
    await page.screenshot({ 
      path: './ui-agent/output/home-screenshot.png', 
      fullPage: true 
    });
    console.log('✅ Home page screenshot taken');
    
    // Check for basic elements
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to create page
    console.log('🔍 Testing create page...');
    await page.goto('http://localhost:3001/create');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: './ui-agent/output/create-screenshot.png', 
      fullPage: true 
    });
    console.log('✅ Create page screenshot taken');
    
    // Basic accessibility check
    console.log('♿ Running basic accessibility check...');
    const missingAltText = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt).length;
    });
    
    const missingLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], textarea'));
      return inputs.filter(input => {
        const id = input.id;
        if (!id) return true;
        const label = document.querySelector(`label[for="${id}"]`);
        return !label;
      }).length;
    });
    
    // Generate simple report
    const report = {
      timestamp: new Date(),
      consoleErrors: errors,
      accessibility: {
        missingAltText,
        missingLabels
      },
      pages: [
        { url: 'http://localhost:3001', title, screenshot: 'home-screenshot.png' },
        { url: 'http://localhost:3001/create', screenshot: 'create-screenshot.png' }
      ]
    };
    
    await fs.writeFile('./ui-agent/output/simple-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 Simple UI Test Results:');
    console.log(`   Console Errors: ${errors.length}`);
    console.log(`   Missing Alt Text: ${missingAltText}`);
    console.log(`   Missing Form Labels: ${missingLabels}`);
    console.log(`   Screenshots: ${report.pages.length}`);
    console.log('\n✅ Simple test complete! Check ./ui-agent/output/ for results');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

simpleUITest();