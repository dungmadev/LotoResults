import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProvinces } from '../services/api';
import { REGION_NAMES } from '../types';
import type { Province } from '../types';

interface NextDraw {
    province: Province;
    drawTime: Date;
    timeRemaining: number;
}

function getNextDraws(provinces: Province[]): NextDraw[] {
    const now = new Date();
    const nextDraws: NextDraw[] = [];
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (const province of provinces) {
        if (!province.draw_days || province.draw_days.length === 0 || !province.draw_time) continue;
        
        const currentDay = dayNames[now.getDay()];
        const [hours, minutes] = province.draw_time.split(':').map(Number);
        
        // Check if today is a draw day
        if (province.draw_days.includes(currentDay)) {
            const todayDraw = new Date(now);
            todayDraw.setHours(hours, minutes, 0, 0);
            
            if (todayDraw > now) {
                nextDraws.push({
                    province,
                    drawTime: todayDraw,
                    timeRemaining: todayDraw.getTime() - now.getTime(),
                });
                continue;
            }
        }
        
        // Find next draw day
        for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + daysAhead);
            const nextDayName = dayNames[nextDate.getDay()];
            
            if (province.draw_days.includes(nextDayName)) {
                nextDate.setHours(hours, minutes, 0, 0);
                nextDraws.push({
                    province,
                    drawTime: nextDate,
                    timeRemaining: nextDate.getTime() - now.getTime(),
                });
                break;
            }
        }
    }
    
    // Sort by time remaining
    nextDraws.sort((a, b) => a.timeRemaining - b.timeRemaining);
    return nextDraws;
}

function formatTimeRemaining(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export default function Countdown() {
    const [, setTick] = useState(0);
    
    const { data: provinces } = useQuery({
        queryKey: ['provinces'],
        queryFn: () => fetchProvinces(),
        staleTime: 1000 * 60 * 60,
    });
    
    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);
    
    if (!provinces || provinces.length === 0) return null;
    
    const nextDraws = getNextDraws(provinces).slice(0, 3); // Show top 3 next draws
    
    if (nextDraws.length === 0) return null;
    
    return (
        <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            color: 'white',
        }} className="animate-fade-in">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                ⏰ Kỳ Quay Sắp Tới
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                {nextDraws.map((next) => (
                    <div
                        key={next.province.id}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                <span className={`region-badge ${next.province.region}`} style={{ marginRight: '8px' }}>
                                    {REGION_NAMES[next.province.region]}
                                </span>
                                {next.province.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                {next.drawTime.toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '1px',
                        }}>
                            {formatTimeRemaining(next.timeRemaining)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
