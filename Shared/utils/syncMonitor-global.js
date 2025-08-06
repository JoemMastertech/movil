/**
 * Global Sync Monitor - Development tool for monitoring data synchronization
 * Compatible with older browsers - no ES6 imports
 */

(function(window) {
    'use strict';

    /**
     * SyncMonitor constructor
     */
    function SyncMonitor() {
        this.adapter = null;
        this.isEnabled = false;
    }

    /**
     * Initialize monitor with adapter reference
     * @param {Object} adapter - ProductDataAdapter instance
     */
    SyncMonitor.prototype.init = function(adapter) {
        this.adapter = adapter;
        this.isEnabled = true;
        
        var self = this;
        
        // Expose global functions for console access
        if (typeof window !== 'undefined') {
            window.syncMonitor = {
                status: function() { return self.getFullStatus(); },
                cache: function() { return self.getCacheStatus(); },
                sync: function() { return self.forceSync(); },
                start: function() { return self.startSync(); },
                stop: function() { return self.stopSync(); },
                clear: function() { return self.clearCache(); },
                help: function() { return self.showHelp(); }
            };
            
            if (window.Logger && window.Logger.info) {
                window.Logger.info('🔧 SyncMonitor initialized. Type "syncMonitor.help()" for available commands.');
            }
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('SyncMonitor: Initialized');
        }
    };

    /**
     * Get comprehensive status information
     * @returns {Object} Complete status information
     */
    SyncMonitor.prototype.getFullStatus = function() {
        if (!this.adapter) {
            return { error: 'Adapter not initialized' };
        }

        var syncStatus = this.adapter.getSyncStatus();
        var cacheStats = window.SimpleCache ? window.SimpleCache.getStats() : {};
        
        var status = {
            timestamp: new Date().toISOString(),
            sync: {
                isRunning: syncStatus.isRunning,
                lastSyncTime: syncStatus.lastSyncTime,
                autoUpdateEnabled: syncStatus.autoUpdateEnabled,
                nextSyncIn: syncStatus.nextSyncIn ? Math.round(syncStatus.nextSyncIn / 1000) + 's' : 'N/A'
            },
            cache: cacheStats,
            supabase: {
                url: this.adapter.supabaseUrl ? 'Configured' : 'Not configured',
                key: this.adapter.supabaseKey ? 'Present' : 'Missing'
            }
        };

        var tableData = {};
        tableData['Sync Status'] = syncStatus.isRunning ? '🟢 Running' : '🔴 Stopped';
        tableData['Last Sync'] = syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Never';
        tableData['Cache Hit Rate'] = cacheStats.hitRate || 'N/A';
        tableData['Cache Size'] = cacheStats.cacheSize || 0;
        tableData['Auto Update'] = syncStatus.autoUpdateEnabled ? '✅ Enabled' : '❌ Disabled';
        
        if (console && console.table) {
            console.table(tableData);
        }

        return status;
    };

    /**
     * Get detailed cache status
     * @returns {Object} Cache information
     */
    SyncMonitor.prototype.getCacheStatus = function() {
        var stats = window.SimpleCache ? window.SimpleCache.getStats() : {};
        var keys = stats.memoryKeys || [];
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('Cache Statistics:');
        }
        
        if (console && console.table) {
            console.table(stats);
        }
        
        if (keys.length > 0) {
            if (window.Logger && window.Logger.info) {
                window.Logger.info('\nCached Items:');
            }
            
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var info = window.SimpleCache ? window.SimpleCache.getCacheInfo(key) : null;
                if (info) {
                    var message = key + ': ' + info.accessCount + ' accesses, expires in ' + Math.round(info.timeToExpire / 1000) + 's';
                    if (window.Logger && window.Logger.info) {
                        window.Logger.info(message);
                    }
                }
            }
        }
        
        return stats;
    };

    /**
     * Force immediate synchronization
     */
    SyncMonitor.prototype.forceSync = function() {
        if (!this.adapter) {
            if (window.Logger && window.Logger.error) {
                window.Logger.error('Adapter not available');
            }
            return Promise.resolve();
        }

        if (window.Logger && window.Logger.info) {
            window.Logger.info('Starting forced synchronization...');
        }
        
        var startTime = Date.now();
        var self = this;
        
        if (this.adapter.forceSyncNow) {
            return this.adapter.forceSyncNow().then(function() {
                var duration = Date.now() - startTime;
                if (window.Logger && window.Logger.info) {
                    window.Logger.info('Sync completed in ' + duration + 'ms');
                }
            }).catch(function(error) {
                if (window.Logger && window.Logger.error) {
                    window.Logger.error('Sync failed:', error.message);
                }
            });
        }
        
        return Promise.resolve();
    };

    /**
     * Start automatic synchronization
     */
    SyncMonitor.prototype.startSync = function() {
        if (!this.adapter) {
            if (window.Logger && window.Logger.error) {
                window.Logger.error('Adapter not available');
            }
            return;
        }

        if (this.adapter.startAutoSync) {
            this.adapter.startAutoSync();
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('▶️ Auto-sync started');
        }
    };

    /**
     * Stop automatic synchronization
     */
    SyncMonitor.prototype.stopSync = function() {
        if (!this.adapter) {
            if (window.Logger && window.Logger.error) {
                window.Logger.error('Adapter not available');
            }
            return;
        }

        if (this.adapter.stopAutoSync) {
            this.adapter.stopAutoSync();
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('⏹️ Auto-sync stopped');
        }
    };

    /**
     * Clear all cache data
     */
    SyncMonitor.prototype.clearCache = function() {
        var beforeSize = 0;
        
        if (window.SimpleCache && window.SimpleCache.getStats) {
            beforeSize = window.SimpleCache.getStats().cacheSize || 0;
        }
        
        if (window.SimpleCache && window.SimpleCache.clear) {
            window.SimpleCache.clear();
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('Cache cleared (' + beforeSize + ' items removed)');
        }
    };

    /**
     * Show available commands
     */
    SyncMonitor.prototype.showHelp = function() {
        var commands = {
            'syncMonitor.status()': 'Show complete sync and cache status',
            'syncMonitor.cache()': 'Show detailed cache information',
            'syncMonitor.sync()': 'Force immediate synchronization',
            'syncMonitor.start()': 'Start automatic synchronization',
            'syncMonitor.stop()': 'Stop automatic synchronization',
            'syncMonitor.clear()': 'Clear all cache data',
            'syncMonitor.help()': 'Show this help message'
        };

        if (window.Logger && window.Logger.info) {
            window.Logger.info('Available SyncMonitor Commands:');
        }
        
        if (console && console.table) {
            console.table(commands);
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('\nTips:');
            window.Logger.info('- Use status() to check if sync is working properly');
            window.Logger.info('- Use cache() to see cache performance');
            window.Logger.info('- Use sync() to test immediate data updates');
        }
    };

    /**
     * Log sync event for monitoring
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    SyncMonitor.prototype.logSyncEvent = function(event, data) {
        if (!this.isEnabled) return;
        
        data = data || {};
        var timestamp = new Date().toISOString();
        var eventData = { timestamp: timestamp };
        
        // Copy data properties
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                eventData[key] = data[key];
            }
        }
        
        if (window.Logger && window.Logger.debug) {
            window.Logger.debug('SyncMonitor: ' + event, eventData);
        }
    };

    /**
     * Disable monitor and clean up
     */
    SyncMonitor.prototype.destroy = function() {
        this.isEnabled = false;
        this.adapter = null;
        
        if (typeof window !== 'undefined' && window.syncMonitor) {
            delete window.syncMonitor;
        }
        
        if (window.Logger && window.Logger.info) {
            window.Logger.info('SyncMonitor: Destroyed');
        }
    };

    // Create singleton instance
    var syncMonitorInstance = new SyncMonitor();

    // Export to global scope
    window.SyncMonitor = SyncMonitor;
    window.syncMonitorInstance = syncMonitorInstance;
    
    // Legacy export
    window.syncMonitor = syncMonitorInstance;

})(window);