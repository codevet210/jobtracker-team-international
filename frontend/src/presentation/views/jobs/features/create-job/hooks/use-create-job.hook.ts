"use client";

import { useReducer, type Dispatch, type FormEvent } from "react";
import { createJobAction } from "@/application/jobs/job.actions";
import { DEMO_CUSTOMER_ID } from "@/shared/config/env";
import type { CreateJobInput } from "@/shared/types/job";

export type CreateJobState = CreateJobInput & {
  isSubmitting: boolean;
  error: string | null;
};

export type CreateJobFieldAction =
  | { type: "setField"; field: keyof CreateJobInput; value: string }
  | { type: "reset" }
  | { type: "submitStart" }
  | { type: "submitSuccess" }
  | { type: "submitFailure"; error: string };

export const initialCreateJobState: CreateJobState = {
  title: "",
  description: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  customerId: DEMO_CUSTOMER_ID,
  isSubmitting: false,
  error: null,
};

export function createJobReducer(
  state: CreateJobState,
  action: CreateJobFieldAction,
): CreateJobState {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value, error: null };
    case "reset":
      return initialCreateJobState;
    case "submitStart":
      return { ...state, isSubmitting: true, error: null };
    case "submitSuccess":
      return { ...initialCreateJobState };
    case "submitFailure":
      return { ...state, isSubmitting: false, error: action.error };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export function validateCreateJob(state: CreateJobState): string | null {
  if (state.title.trim().length === 0) {
    return "Title is required.";
  }
  if (state.street.trim().length === 0) {
    return "Street is required.";
  }
  if (state.city.trim().length === 0) {
    return "City is required.";
  }
  if (state.state.trim().length === 0) {
    return "State is required.";
  }
  if (state.zipCode.trim().length === 0) {
    return "ZIP code is required.";
  }
  return null;
}

export function useCreateJob(onCreated: () => void) {
  const [state, dispatch] = useReducer(createJobReducer, initialCreateJobState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateCreateJob(state);
    if (validationError) {
      dispatch({ type: "submitFailure", error: validationError });
      return;
    }

    dispatch({ type: "submitStart" });
    try {
      await createJobAction({
        title: state.title,
        description: state.description,
        street: state.street,
        city: state.city,
        state: state.state,
        zipCode: state.zipCode,
        customerId: state.customerId,
      });
      dispatch({ type: "submitSuccess" });
      onCreated();
    } catch (error) {
      dispatch({
        type: "submitFailure",
        error: error instanceof Error ? error.message : "Create failed.",
      });
    }
  }

  return { state, dispatch, handleSubmit };
}

export type CreateJobDispatch = Dispatch<CreateJobFieldAction>;
