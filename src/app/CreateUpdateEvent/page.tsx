"use client";

import React, { useEffect, useState, Suspense } from "react";
import { IEvent, IEventInput, Tag } from "@/lib/models/Event";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";

const CreateUpdateEventPage = () => {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<IEventInput>({
    name: "",
    description: "",
    club: "",
    start: new Date(),
    location: "",
    registrationLink: "",
    flyer: "",
    tags: [],
  });
};
