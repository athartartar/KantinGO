<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ImageUploadService
{
    public function storeMenuImage(UploadedFile $file): string
    {
        $realPath = $file->getRealPath();
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = $finfo ? finfo_file($finfo, $realPath) : $file->getMimeType();
        if ($finfo) {
            finfo_close($finfo);
        }

        $image = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($realPath),
            'image/png' => @imagecreatefrompng($realPath),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($realPath) : false,
            default => false,
        };

        if (! $image) {
            throw ValidationException::withMessages([
                'image' => ['File gambar tidak valid atau format tidak didukung (hanya JPEG, PNG, WebP).'],
            ]);
        }

        ob_start();
        $ext = match ($mime) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        if ($ext === 'png') {
            imagesavealpha($image, true);
            imagepng($image, null, 6);
        } elseif ($ext === 'webp' && function_exists('imagewebp')) {
            imagewebp($image, null, 85);
        } else {
            imagejpeg($image, null, 85);
            $ext = 'jpg';
        }

        $binary = ob_get_clean();
        imagedestroy($image);

        if ($binary === false || $binary === '') {
            throw ValidationException::withMessages([
                'image' => ['Gagal memproses file gambar.'],
            ]);
        }

        $path = 'menus/'.bin2hex(random_bytes(16)).'.'.$ext;
        Storage::disk('public')->put($path, $binary);

        return $path;
    }
}
