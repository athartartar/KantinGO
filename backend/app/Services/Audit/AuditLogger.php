<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditLogger
{
    public static function log(
        ?int $userId,
        string $action,
        string $auditableType,
        int $auditableId,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        $req = $request ?? request();

        return AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'metadata' => $metadata,
            'ip_address' => $req?->ip(),
            'user_agent' => $req ? Str::limit((string) $req->userAgent(), 500, '') : null,
        ]);
    }
}
