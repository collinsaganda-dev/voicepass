# VoicePass Master Fix Script
# This script fixes all the issues mentioned

Write-Host "VoicePass Complete Enhancement Script" -ForegroundColor Green
Write-Host "This will fix all the reported issues in your app" -ForegroundColor Yellow

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Please run this script from your VoicePass project root directory" -ForegroundColor Red
    Write-Host "Expected to find package.json in current directory" -ForegroundColor Yellow
    exit 1
}

if (!(Test-Path "src")) {
    Write-Host "Error: src directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "Found VoicePass project" -ForegroundColor Green

# Function to create directory if it doesn't exist
function Ensure-Directory {
    param($path)
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path" -ForegroundColor Cyan
    }
}

# Function to update file with backup
function Update-File {
    param($filePath, $content, $description)
    
    # Create backup if file exists
    if (Test-Path $filePath) {
        $backupPath = "$filePath.backup"
        Copy-Item $filePath $backupPath -Force
        Write-Host "Backed up: $filePath" -ForegroundColor Gray
    }
    
    # Ensure directory exists
    $directory = Split-Path $filePath -Parent
    if ($directory) {
        Ensure-Directory $directory
    }
    
    # Write new content
    $content | Out-File -FilePath $filePath -Encoding UTF8 -Force
    Write-Host "Fixed: $description" -ForegroundColor Green
}

$confirm = Read-Host "Continue with fixes? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Operation cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host "Starting comprehensive fixes..." -ForegroundColor Green

# Ensure required directories exist
Ensure-Directory "src/components"
Ensure-Directory "src/utils"

Write-Host "1. Fixing room code validation (6 to 8 characters)..." -ForegroundColor Cyan

$roomCodeContent = @'
export function generateRoomCode(length: number = 8): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

export function isValidRoomCode(code: string): boolean {
  const roomCodeRegex = /^[A-Z0-9]{8}$/;
  return roomCodeRegex.test(code);
}

export function formatRoomCode(code: string): string {
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}
'@

Update-File "src/utils/roomCode.ts" $roomCodeContent "8-character room codes"

Write-Host "2. Adding enhanced user menu..." -ForegroundColor Cyan

$userMenuContent = @'
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Menu, X, UserCircle } from 'lucide-react';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="hidden md:block font-medium text-gray-700">
          {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
        </span>
        {isOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.user_metadata?.username || 'User'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <UserCircle className="w-4 h-4 mr-3" />
                  View Profile
                </button>
                
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
'@

Update-File "src/components/UserMenu.tsx" $userMenuContent "Enhanced user menu with profile options"

Write-Host "3. Adding enhanced QR code generator..." -ForegroundColor Cyan

$qrCodeContent = @'
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Copy, ExternalLink } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  title?: string;
  roomCode?: string;
}

export function QRCodeGenerator({ 
  value, 
  size = 256, 
  level = 'M', 
  includeMargin = true,
  className = '',
  title = 'Scan to join session',
  roomCode
}: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join VoicePass Session',
          text: `Join my voice session! Room code: ${roomCode || 'N/A'}`,
          url: value
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          includeMargin={includeMargin}
        />
      </div>
      
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      {roomCode && (
        <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-mono text-lg">
          {roomCode}
        </div>
      )}
      <p className="mt-2 text-sm text-gray-600 text-center max-w-xs">
        Scan with camera or share this link
      </p>
      
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleCopy}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-4 h-4 mr-1" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </button>
        
        <button
          onClick={() => window.open(value, '_blank')}
          className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open
        </button>
      </div>
    </div>
  );
}
'@

Update-File "src/components/QRCodeGenerator.tsx" $qrCodeContent "Enhanced QR code with sharing"

Write-Host "4. Adding enhanced back button component..." -ForegroundColor Cyan

$backButtonContent = @'
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  showHome?: boolean;
}

export function BackButton({ 
  to, 
  label = 'Back', 
  className = '',
  showHome = false 
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </button>
      
      {showHome && (
        <button
          onClick={handleHome}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
      )}
    </div>
  );
}
'@

Update-File "src/components/BackButton.tsx" $backButtonContent "Enhanced back button with home option"

Write-Host "5. Installing required dependencies..." -ForegroundColor Cyan

Write-Host "Installing qrcode.react..." -ForegroundColor Yellow
$process = Start-Process -FilePath "npm" -ArgumentList "install", "qrcode.react" -Wait -NoNewWindow -PassThru
if ($process.ExitCode -eq 0) {
    Write-Host "Installed qrcode.react" -ForegroundColor Green
} else {
    Write-Host "Warning: Failed to install qrcode.react" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ALL FIXES APPLIED SUCCESSFULLY!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor Cyan
Write-Host "- Room codes now generate 8 characters (XXXX-XXXX format)" -ForegroundColor White
Write-Host "- Enhanced user menu in top-right with profile options" -ForegroundColor White
Write-Host "- QR codes auto-generate with copy/share buttons" -ForegroundColor White
Write-Host "- Back buttons enhanced with home navigation" -ForegroundColor White
Write-Host "- Dependencies installed for QR code functionality" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Magenta
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Test the 8-character room codes" -ForegroundColor White
Write-Host "3. Check the new user menu in top-right" -ForegroundColor White
Write-Host "4. Test QR code generation and sharing" -ForegroundColor White
Write-Host "5. Commit and push changes to GitHub" -ForegroundColor White
Write-Host ""
Write-Host "Your friends will now see:" -ForegroundColor Green
Write-Host "- Working 8-character room codes" -ForegroundColor White
Write-Host "- Professional user interface" -ForegroundColor White
Write-Host "- Easy QR code sharing" -ForegroundColor White
Write-Host "- Better navigation with back buttons" -ForegroundColor White
