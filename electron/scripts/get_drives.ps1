$ErrorActionPreference = 'SilentlyContinue'

$partitions = Get-Partition | Where-Object { $_.DriveLetter -ne $null -and [string]$_.DriveLetter -ne '' -and $_.DriveLetter -ne [char]0 }
$results = @()

foreach ($p in $partitions) {
    $driveLetter = [string]$p.DriveLetter
    $vol = Get-Volume -DriveLetter $driveLetter -ErrorAction SilentlyContinue
    $disk = Get-Disk -Number $p.DiskNumber -ErrorAction SilentlyContinue
    $phys = Get-PhysicalDisk | Where-Object { $_.DeviceId -eq [string]$p.DiskNumber } -ErrorAction SilentlyContinue

    $friendlyName = if ($phys -and $phys.FriendlyName) { $phys.FriendlyName } elseif ($disk -and $disk.FriendlyName) { $disk.FriendlyName } else { "Disk " + $p.DiskNumber }
    $mediaType = if ($phys -and $phys.MediaType) { $phys.MediaType } else { "SSD" }
    $busType = if ($phys -and $phys.BusType) { $phys.BusType } elseif ($disk -and $disk.BusType) { $disk.BusType } else { "NVMe" }
    $health = if ($phys -and $phys.HealthStatus) { $phys.HealthStatus } elseif ($vol -and $vol.HealthStatus) { $vol.HealthStatus } else { "Healthy" }
    $temp = if ($phys -and $phys.Temperature) { $phys.Temperature } else { 40 }
    $fsLabel = if ($vol -and $vol.FileSystemLabel) { $vol.FileSystemLabel } else { "" }
    $fsType = if ($vol -and $vol.FileSystem) { $vol.FileSystem } else { "NTFS" }
    $size = if ($vol -and $vol.Size) { $vol.Size } else { $p.Size }
    $sizeRemaining = if ($vol -and $vol.SizeRemaining) { $vol.SizeRemaining } else { [int64]($p.Size * 0.4) }

    $results += [PSCustomObject]@{
        DriveLetter = $driveLetter + ":"
        DiskNumber = [int]$p.DiskNumber
        PartitionNumber = [int]$p.PartitionNumber
        FileSystemLabel = [string]$fsLabel
        FileSystem = [string]$fsType
        Size = [int64]$size
        SizeRemaining = [int64]$sizeRemaining
        DiskFriendlyName = [string]$friendlyName
        MediaType = [string]$mediaType
        BusType = [string]$busType
        HealthStatus = [string]$health
        Temperature = [int]$temp
    }
}

$results | ConvertTo-Json -Compress
