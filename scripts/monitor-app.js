#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AppMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.logFile = path.join(__dirname, '..', 'test-results', 'monitor.log');
    
    // Ensure test-results directory exists
    const testDir = path.dirname(this.logFile);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Write to log file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async checkBuildErrors() {
    this.log('🔍 Checking for build errors...');
    
    return new Promise((resolve) => {
      exec('npm run build', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          this.errors.push(`Build Error: ${error.message}`);
          this.log(`❌ Build failed: ${error.message}`);
        } else {
          this.log('✅ Build successful');
        }
        
        if (stderr) {
          this.warnings.push(`Build Warning: ${stderr}`);
          this.log(`⚠️ Build warnings: ${stderr}`);
        }
        
        resolve();
      });
    });
  }

  async checkLintErrors() {
    this.log('🔍 Checking for lint errors...');
    
    return new Promise((resolve) => {
      exec('npm run lint', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          this.errors.push(`Lint Error: ${error.message}`);
          this.log(`❌ Lint failed: ${error.message}`);
        } else {
          this.log('✅ Lint passed');
        }
        
        resolve();
      });
    });
  }

  async checkTypeErrors() {
    this.log('🔍 Checking for TypeScript errors...');
    
    return new Promise((resolve) => {
      exec('npx tsc --noEmit', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          this.errors.push(`TypeScript Error: ${error.message}`);
          this.log(`❌ TypeScript check failed: ${error.message}`);
        } else {
          this.log('✅ TypeScript check passed');
        }
        
        if (stdout) {
          this.log(`TypeScript output: ${stdout}`);
        }
        
        resolve();
      });
    });
  }

  async checkDatabaseConnection() {
    this.log('🔍 Checking database schema...');
    
    return new Promise((resolve) => {
      exec('npx prisma validate', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          this.errors.push(`Database Schema Error: ${error.message}`);
          this.log(`❌ Database schema validation failed: ${error.message}`);
        } else {
          this.log('✅ Database schema is valid');
        }
        
        resolve();
      });
    });
  }

  async checkSecurityIssues() {
    this.log('🔍 Checking for security vulnerabilities...');
    
    return new Promise((resolve) => {
      exec('npm audit --audit-level moderate', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error && error.code === 1) {
          // npm audit returns exit code 1 when vulnerabilities are found
          this.warnings.push(`Security Warning: ${stdout}`);
          this.log(`⚠️ Security vulnerabilities found: ${stdout}`);
        } else {
          this.log('✅ No critical security issues found');
        }
        
        resolve();
      });
    });
  }

  async generateReport() {
    this.log('📊 Generating monitoring report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errors: this.errors,
      warnings: this.warnings,
      status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
      summary: {
        buildCheck: this.errors.find(e => e.includes('Build Error')) ? 'FAILED' : 'PASSED',
        lintCheck: this.errors.find(e => e.includes('Lint Error')) ? 'FAILED' : 'PASSED',
        typeCheck: this.errors.find(e => e.includes('TypeScript Error')) ? 'FAILED' : 'PASSED',
        databaseCheck: this.errors.find(e => e.includes('Database Schema Error')) ? 'FAILED' : 'PASSED',
        securityCheck: this.warnings.find(w => w.includes('Security Warning')) ? 'WARNINGS' : 'PASSED',
      }
    };
    
    const reportPath = path.join(__dirname, '..', 'test-results', 'monitoring-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📋 Report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('🔍 APPLICATION MONITORING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Overall Status: ${report.status}`);
    console.log(`Total Errors: ${report.totalErrors}`);
    console.log(`Total Warnings: ${report.totalWarnings}`);
    console.log('\nComponent Status:');
    Object.entries(report.summary).forEach(([check, status]) => {
      const icon = status === 'PASSED' ? '✅' : status === 'WARNINGS' ? '⚠️' : '❌';
      console.log(`${icon} ${check}: ${status}`);
    });
    console.log('='.repeat(50) + '\n');
    
    return report;
  }

  async runFullMonitoring() {
    this.log('🚀 Starting full application monitoring...');
    
    await this.checkDatabaseConnection();
    await this.checkTypeErrors();
    await this.checkLintErrors();
    await this.checkBuildErrors();
    await this.checkSecurityIssues();
    
    return await this.generateReport();
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new AppMonitor();
  monitor.runFullMonitoring()
    .then(report => {
      process.exit(report.totalErrors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = AppMonitor;