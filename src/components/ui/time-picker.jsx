import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TimePicker = ({ value, onChange, className }) => {
    // Get hours and minutes from the date object
    const hours = value ? value.getHours() : 0;
    const minutes = value ? value.getMinutes() : 0;

    // Generate arrays for hours (0-23) and minutes (0-59)
    const hoursArray = Array.from({ length: 24 }, (_, i) => i);
    const minutesArray = Array.from({ length: 60 }, (_, i) => i);

    const handleHourChange = (newHour) => {
        const newDate = new Date(value);
        newDate.setHours(parseInt(newHour));
        onChange(newDate);
    };

    const handleMinuteChange = (newMinute) => {
        const newDate = new Date(value);
        newDate.setMinutes(parseInt(newMinute));
        onChange(newDate);
    };

    // Format number to always show two digits
    const formatNumber = (num) => num.toString().padStart(2, '0');

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex flex-col gap-1">
                <Label className="text-xs">Hour</Label>
                <Select value={hours.toString()} onValueChange={handleHourChange}>
                    <SelectTrigger className="w-20">
                        <SelectValue>{formatNumber(hours)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {hoursArray.map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                                {formatNumber(hour)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <span className="mt-6">:</span>

            <div className="flex flex-col gap-1">
                <Label className="text-xs">Minute</Label>
                <Select value={minutes.toString()} onValueChange={handleMinuteChange}>
                    <SelectTrigger className="w-20">
                        <SelectValue>{formatNumber(minutes)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {minutesArray.map((minute) => (
                            <SelectItem key={minute} value={minute.toString()}>
                                {formatNumber(minute)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default TimePicker;