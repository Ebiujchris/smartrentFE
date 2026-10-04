"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addMonths } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { paymentService } from "@/services/payment.service";
import { leaseService } from "@/services/lease.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PaymentRow = {
  id: string;
  amount: number | string;
  dueDate: string;
  paidDate?: string | null;
  status: string;
  leaseId?: string;
  tenantId?: string;
  tenant?: { id?: string; user?: { fullName?: string } };
  lease?: {
    id: string;
    unit?: {
      unitNumber?: string;
      property?: { name?: string };
    };
  };
};

type LeaseRow = {
  id: string;
  tenantId: string;
  rentAmount: number | string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  tenant?: { user?: { fullName?: string } };
  unit?: { unitNumber?: string; property?: { name?: string } };
};

type CalendarEvent = {
  id: string;
  payment: PaymentRow;
  date: Date;
  kind: "due" | "received";
  status: "DUE" | "OVERDUE" | "PAID" | "CANCELLED";
};

type EventFilter = "all" | "due" | "received";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseCalendarDate(value?: string | null): Date | null {
  if (!value) return null;
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateWithinLease(lease: LeaseRow, preferredDate: Date): string {
  const startDate = parseCalendarDate(lease.startDate);
  const endDate = parseCalendarDate(lease.endDate);
  if (!startDate || !endDate || endDate < startDate) return dateKey(preferredDate);
  if (preferredDate < startDate) return dateKey(startDate);
  if (preferredDate > endDate) return dateKey(endDate);
  return dateKey(preferredDate);
}

function monthlyDueDates(firstDueDate: Date, leaseEndDate: Date): string[] {
  const dueDay = firstDueDate.getDate();
  const dates: string[] = [];

  for (let monthOffset = 0; ; monthOffset += 1) {
    const year = firstDueDate.getFullYear();
    const month = firstDueDate.getMonth() + monthOffset;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const dueDate = new Date(year, month, Math.min(dueDay, lastDayOfMonth));
    if (dueDate > leaseEndDate) break;
    dates.push(dateKey(dueDate));
  }

  return dates;
}

function formatCurrency(amount: number | string): string {
  return `UGX ${Number(amount || 0).toLocaleString("en-UG", { maximumFractionDigits: 0 })}`;
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-UG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDueStatus(payment: PaymentRow, dueDate: Date, today: Date): CalendarEvent["status"] {
  if (payment.status === "CANCELLED") return "CANCELLED";
  if (payment.status === "PAID") return "PAID";
  if (payment.status === "OVERDUE") return "OVERDUE";
  return dateKey(dueDate) < dateKey(today) ? "OVERDUE" : "DUE";
}

function getPaymentLocation(payment: PaymentRow): string {
  const property = payment.lease?.unit?.property?.name;
  const unit = payment.lease?.unit?.unitNumber;
  if (property && unit) return `${property} · Unit ${unit}`;
  return property || (unit ? `Unit ${unit}` : "Property not available");
}

export default function RentCalendarPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [leases, setLeases] = useState<LeaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [repeatMonthly, setRepeatMonthly] = useState(true);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [dueDateInput, setDueDateInput] = useState(() => dateKey(new Date()));
  const [amountInput, setAmountInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([paymentService.getAllPayments(), leaseService.getAllLeases()])
      .then(([paymentRows, leaseRows]) => {
        if (!isCurrent) return;
        setPayments(Array.isArray(paymentRows) ? paymentRows : []);
        setLeases(Array.isArray(leaseRows) ? leaseRows : []);
      })
      .catch((error) => {
        if (!isCurrent) return;
        console.error("Failed to load rent calendar:", error);
        setLoadError("Rent calendar data could not be loaded.");
        toast.error("Could not load rent calendar");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  const activeLeases = useMemo(
    () => leases.filter((lease) => lease.isActive),
    [leases],
  );

  const properties = useMemo(() => {
    return Array.from(
      new Set(
        payments
          .map((payment) => payment.lease?.unit?.property?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [payments]);

  const allEvents = useMemo(() => {
    const today = new Date();
    return payments.flatMap((payment): CalendarEvent[] => {
      const events: CalendarEvent[] = [];
      const dueDate = parseCalendarDate(payment.dueDate);
      if (dueDate && payment.status !== "CANCELLED") {
        events.push({
          id: `${payment.id}-due`,
          payment,
          date: dueDate,
          kind: "due",
          status: getDueStatus(payment, dueDate, today),
        });
      }

      const paidDate = parseCalendarDate(payment.paidDate);
      if (paidDate && payment.status === "PAID") {
        events.push({
          id: `${payment.id}-received`,
          payment,
          date: paidDate,
          kind: "received",
          status: "PAID",
        });
      }
      return events;
    });
  }, [payments]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesProperty = propertyFilter === "all" ||
        event.payment.lease?.unit?.property?.name === propertyFilter;
      const matchesType = eventFilter === "all" || event.kind === eventFilter;
      return matchesProperty && matchesType;
    });
  }, [allEvents, eventFilter, propertyFilter]);

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((event) => {
      const key = dateKey(event.date);
      grouped.set(key, [...(grouped.get(key) || []), event]);
    });
    return grouped;
  }, [filteredEvents]);

  const selectedDayEvents = eventsByDay.get(dateKey(selectedDate)) || [];
  const monthDueEvents = filteredEvents.filter((event) =>
    event.kind === "due" &&
    event.date.getMonth() === visibleMonth.getMonth() &&
    event.date.getFullYear() === visibleMonth.getFullYear(),
  );
  const monthReceivedEvents = filteredEvents.filter((event) =>
    event.kind === "received" &&
    event.date.getMonth() === visibleMonth.getMonth() &&
    event.date.getFullYear() === visibleMonth.getFullYear(),
  );
  const monthOverdueAmount = monthDueEvents
    .filter((event) => event.status === "OVERDUE")
    .reduce((total, event) => total + Number(event.payment.amount || 0), 0);
  const monthReceivedAmount = monthReceivedEvents
    .reduce((total, event) => total + Number(event.payment.amount || 0), 0);

  const selectedLease = activeLeases.find((lease) => lease.id === selectedLeaseId);
  const proposedDueDates = useMemo(() => {
    const firstDueDate = parseCalendarDate(dueDateInput);
    const leaseEndDate = parseCalendarDate(selectedLease?.endDate);
    if (!firstDueDate || !leaseEndDate) return [];
    return repeatMonthly ? monthlyDueDates(firstDueDate, leaseEndDate) : [dateKey(firstDueDate)];
  }, [dueDateInput, repeatMonthly, selectedLease]);

  const refreshCalendar = () => {
    setIsLoading(true);
    setLoadError("");
    setRefreshKey((value) => value + 1);
  };

  const moveMonth = (amount: number) => {
    setVisibleMonth((month) => addMonths(month, amount));
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const openScheduleForm = () => {
    const lease = activeLeases[0];
    setSelectedLeaseId(lease?.id || "");
    setAmountInput(lease ? String(Number(lease.rentAmount)) : "");
    setDueDateInput(lease ? getDateWithinLease(lease, selectedDate) : dateKey(selectedDate));
    setRepeatMonthly(true);
    setShowScheduleForm(true);
  };

  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    const lease = activeLeases.find((item) => item.id === leaseId);
    setAmountInput(lease ? String(Number(lease.rentAmount)) : "");
    if (lease) setDueDateInput(getDateWithinLease(lease, selectedDate));
  };

  const handleSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLease || !dueDateInput || Number(amountInput) <= 0) return;

    const firstDueDate = parseCalendarDate(dueDateInput);
    const leaseStartDate = parseCalendarDate(selectedLease.startDate);
    const leaseEndDate = parseCalendarDate(selectedLease.endDate);
    if (!firstDueDate || !leaseStartDate || !leaseEndDate || firstDueDate < leaseStartDate || firstDueDate > leaseEndDate) {
      toast.error("Choose a due date within the lease period");
      return;
    }

    const existingDates = new Set(
      payments
        .filter((payment) =>
          (payment.leaseId || payment.lease?.id) === selectedLease.id && payment.status !== "CANCELLED",
        )
        .map((payment) => parseCalendarDate(payment.dueDate))
        .filter((date): date is Date => Boolean(date))
        .map(dateKey),
    );
    const datesToCreate = proposedDueDates.filter((date) => !existingDates.has(date));
    if (datesToCreate.length === 0) {
      toast.error("All selected rent due dates are already scheduled");
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.allSettled(datesToCreate.map((dueDate) =>
        paymentService.createPayment({
          leaseId: selectedLease.id,
          tenantId: selectedLease.tenantId,
          amount: Number(amountInput),
          dueDate,
        }),
      ));
      const createdCount = results.filter((result) => result.status === "fulfilled").length;
      if (createdCount === 0) {
        toast.error("Could not add rent due dates. Please try again.");
        return;
      }

      setShowScheduleForm(false);
      setSelectedDate(firstDueDate);
      setVisibleMonth(() => {
        return new Date(firstDueDate.getFullYear(), firstDueDate.getMonth(), 1);
      });
      refreshCalendar();
      toast.success(
        createdCount === 1
          ? "Rent due date added to the calendar"
          : `${createdCount} monthly rent due dates added to the calendar`,
      );
      if (createdCount < datesToCreate.length) {
        toast.error(`${datesToCreate.length - createdCount} due dates could not be added`);
      }
    } catch (error) {
      console.error("Failed to schedule rent payment:", error);
      toast.error("Could not schedule this rent payment");
    } finally {
      setIsSaving(false);
    }
  };

  const today = dateKey(new Date());

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Rent operations</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Rent calendar</h1>
          <p className="mt-1 text-sm text-slate-600">Due dates and payments received across your properties.</p>
        </div>
        <Button onClick={openScheduleForm} className="gap-2 self-start sm:self-auto" disabled={activeLeases.length === 0}>
          <Plus className="h-4 w-4" /> Add rent due date
        </Button>
      </header>

      {showScheduleForm && (
        <form onSubmit={handleSchedule} className="border-y border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Schedule a rent payment</h2>
              <p className="text-sm text-slate-500">Add one date or set up monthly due dates through the lease end.</p>
            </div>
            <button type="button" onClick={() => setShowScheduleForm(false)} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Close schedule form">
              <X className="h-4 w-4" />
            </button>
          </div>
          {activeLeases.length === 0 ? (
            <p className="text-sm text-slate-600">Create an active lease before scheduling rent.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Lease / tenant
                <select value={selectedLeaseId} onChange={(event) => handleLeaseChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-normal text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                  {activeLeases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.tenant?.user?.fullName || "Tenant"} · {lease.unit?.property?.name || "Property"} / {lease.unit?.unitNumber || "Unit"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Rent due date
                <input type="date" required min={selectedLease ? dateKey(parseCalendarDate(selectedLease.startDate) || new Date()) : undefined} max={selectedLease ? dateKey(parseCalendarDate(selectedLease.endDate) || new Date()) : undefined} value={dueDateInput} onChange={(event) => setDueDateInput(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-normal text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Amount (UGX)
                <input type="number" min="1" step="1" required value={amountInput} onChange={(event) => setAmountInput(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-normal text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
              </label>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={repeatMonthly} onChange={(event) => setRepeatMonthly(event.target.checked)} className="h-4 w-4 accent-emerald-700" />
                  Repeat monthly to lease end
                </label>
                <Button type="submit" className="w-full gap-2" disabled={isSaving || !selectedLease || proposedDueDates.length === 0}>
                  {isSaving ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isSaving ? "Adding dates..." : `Add ${proposedDueDates.length || "due"} date${proposedDueDates.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}

      <section className="grid grid-cols-1 border-y border-slate-200 bg-white sm:grid-cols-3">
        <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
          <p className="text-sm text-slate-500">Due this month</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">{monthDueEvents.length} <span className="text-sm font-normal text-slate-500">payments</span></p>
        </div>
        <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
          <p className="text-sm text-slate-500">Received this month</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{formatCurrency(monthReceivedAmount)}</p>
          <p className="text-xs text-slate-500">{monthReceivedEvents.length} recorded payments</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-500">Overdue this month</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">{formatCurrency(monthOverdueAmount)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-md bg-slate-100 p-1" aria-label="Filter calendar events">
          {([
            ["all", "All activity"],
            ["due", "Rent due"],
            ["received", "Payments received"],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={eventFilter === value} onClick={() => setEventFilter(value)} className={`rounded px-3 py-2 text-sm transition-colors ${eventFilter === value ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only">Filter by property</span>
            <select value={propertyFilter} onChange={(event) => setPropertyFilter(event.target.value)} className="h-9 min-w-40 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800">
              <option value="all">All properties</option>
              {properties.map((property) => <option key={property} value={property}>{property}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-3 text-xs text-slate-500" aria-label="Calendar legend">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Due</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-600" />Overdue</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" />Received</span>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center text-sm text-slate-500">
          <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> Loading rent calendar...
        </div>
      ) : loadError ? (
        <div className="border-y border-rose-200 bg-rose-50 px-4 py-6 text-center">
          <p className="font-medium text-rose-900">{loadError}</p>
          <Button variant="outline" className="mt-3" onClick={refreshCalendar}>Try again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{visibleMonth.toLocaleDateString("en-UG", { month: "long", year: "numeric" })}</h2>
                <button type="button" onClick={() => {
                  const now = new Date();
                  setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDate(now);
                }} className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Today</button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-l border-t border-slate-200 bg-white">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday} className="border-b border-r border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 sm:py-2.5">{weekday}</div>
              ))}
              {days.map((date) => {
                const key = dateKey(date);
                const dateEvents = eventsByDay.get(key) || [];
                const dueCount = dateEvents.filter((event) => event.kind === "due" && event.status !== "CANCELLED").length;
                const overdueCount = dateEvents.filter((event) => event.kind === "due" && event.status === "OVERDUE").length;
                const receivedCount = dateEvents.filter((event) => event.kind === "received").length;
                const isSelected = key === dateKey(selectedDate);
                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();

                return (
                  <button key={key} type="button" onClick={() => selectDay(date)} aria-label={`${formatLongDate(date)}, ${dueCount} due, ${receivedCount} received`} aria-pressed={isSelected} className={`min-h-[82px] border-b border-r border-slate-200 p-1.5 text-left transition-colors sm:min-h-[112px] sm:p-2 ${isSelected ? "bg-emerald-50 ring-2 ring-inset ring-emerald-600" : "hover:bg-slate-50"} ${isCurrentMonth ? "" : "bg-slate-50/70 text-slate-400"}`}>
                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums ${key === today ? "bg-slate-900 text-white" : isSelected ? "text-emerald-900" : isCurrentMonth ? "text-slate-700" : "text-slate-400"}`}>
                      {date.getDate()}
                    </span>
                    <span className="mt-1.5 flex flex-col gap-1">
                      {dueCount > 0 && <span className={`truncate text-[10px] font-medium leading-4 sm:text-xs ${overdueCount ? "text-rose-700" : "text-amber-700"}`}><span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle ${overdueCount ? "bg-rose-600" : "bg-amber-500"}`} />{dueCount} due</span>}
                      {receivedCount > 0 && <span className="truncate text-[10px] font-medium leading-4 text-emerald-700 sm:text-xs"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 align-middle" />{receivedCount} paid</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="border-y border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Daily agenda</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">{formatLongDate(selectedDate)}</h2>
              </div>
              <CalendarDays className="mt-1 h-5 w-5 text-emerald-700" />
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-700">No rent activity</p>
                  <p className="mt-1 text-xs text-slate-500">Nothing due or received on this date.</p>
                  {activeLeases.length > 0 && <button type="button" onClick={openScheduleForm} className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800">Add a due date</button>}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {selectedDayEvents.map((event) => {
                    const isReceived = event.kind === "received";
                    const isOverdue = event.status === "OVERDUE";
                    return (
                      <li key={event.id} className="flex gap-3 px-4 py-4">
                        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${isReceived ? "bg-emerald-50 text-emerald-700" : isOverdue ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                          {isReceived ? <Check className="h-4 w-4" /> : isOverdue ? <CircleAlert className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{isReceived ? "Payment received" : "Rent due"}</p>
                            <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(event.payment.amount)}</p>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-700">{event.payment.tenant?.user?.fullName || "Tenant"}</p>
                          <p className="truncate text-xs text-slate-500">{getPaymentLocation(event.payment)}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium ${isReceived ? "bg-emerald-50 text-emerald-800" : isOverdue ? "bg-rose-50 text-rose-800" : event.status === "PAID" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                              {isReceived ? "Paid on this date" : event.status === "PAID" ? "Paid" : event.status === "OVERDUE" ? "Overdue" : "Upcoming"}
                            </span>
                            {!isReceived && event.status !== "PAID" && <Link href="/dashboard/payments" className="text-xs font-medium text-emerald-700 hover:text-emerald-900">Record payment <ArrowRight className="ml-0.5 inline h-3 w-3" /></Link>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      {!isLoading && !loadError && payments.length === 0 && (
        <div className="flex flex-col items-center border-y border-slate-200 bg-white px-5 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-600"><CreditCard className="h-5 w-5" /></span>
            <div><p className="font-medium text-slate-900">No rent due dates yet</p><p className="text-sm text-slate-500">Add a date for an active lease to start tracking rent here.</p></div>
          </div>
          {activeLeases.length > 0 && <Button onClick={openScheduleForm} variant="outline" className="mt-4 gap-2 sm:mt-0"><Plus className="h-4 w-4" />Add first due date</Button>}
        </div>
      )}

      <p className="text-xs text-slate-500">A paid rent item appears on both its due date and the date payment was recorded. Future monthly due dates must be scheduled as payment records.</p>
    </div>
  );
}