import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {useFetcher, useNavigate, useSearchParams} from 'react-router';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  FLAG_ON,
  PRODUCT_VIEW_GARMENT,
  ROUTES,
  SEARCH_PARAMS,
} from '~/shared/constants/routes';
import {
  draftOrderIssues,
  findLocation,
  isDraftOrderStep,
  STEP_ORDER,
} from '../../lib/new-draft-order';
import {calculateLeadTime, reconcileInHandsDate} from '../../lib/lead-time';
import {
  DEFAULT_LEAD_TIME_FLAGS,
  newDraftOrderSchema,
} from '../../schemas/new-draft-order.schema';
import type {
  DraftOrderIssue,
  DraftOrderDelivery,
  DraftOrderStep,
  NewDraftOrderValues,
  NewDraftOrderView,
  OrderTypeConfig,
  SaveDraftResult,
  ShopifyStaffMembersData,
} from '../../types/new-draft-order';
import type {DraftProduct} from '../../schemas/draft-product.schema';
import {
  getDraftTotals,
  readDraftIdSession,
  readDraftSession,
  writeDraftIdSession,
  writeDraftSession,
} from '../../lib/draft-products';
import {useNewDraftOrderProductsStore} from '../../store/new-draft-order-products.store';
import {buildDraftOrderLineItemProducts} from '../../lib/draft-line-item-products';
import {useNewDraftOrderBuilderStore} from '../../store/new-draft-order-builder.store';
import {useDraftOrdersListStore} from '../../store/draft-orders-list.store';
import {draftProductsFromListItem, draftValuesFromListItem} from '../../lib/draft-order-open';
import type {DraftOrderListItem} from '../../types/draft-order';

/** Issues that point at a field, so a click can focus it. */
const ISSUE_FIELDS: Partial<
  Record<DraftOrderIssue['id'], keyof NewDraftOrderValues>
> = {
  brands: 'brands',
  ordername: 'orderName',
  description: 'description',
  classification: 'orderClass',
  interface: 'interfaceMode',
};

const ISSUE_STEPS: Partial<Record<keyof NewDraftOrderValues, DraftOrderStep>> = {
  customerId: 'customer',
  inHandsDate: 'customer',
  orderName: 'customer',
  description: 'customer',
  programCode: 'customer',
  programCode2: 'customer',
  brands: 'customer',
  orderClass: 'type',
  interfaceMode: 'type',
  orderType: 'type',
  leadTimeMethods: 'type',
  leadTimeFlags: 'type',
  products: 'products',
  cancelDate: 'ship',
  eventDate: 'ship',
  eventName: 'ship',
  billToLocationId: 'ship',
  poNumber: 'ship',
  shipCode: 'ship',
  deliveries: 'ship',
};

const ISSUE_FIELD_TARGETS: Partial<
  Record<
    keyof NewDraftOrderValues,
    {
      inputId: string;
      errorId?: string;
    }
  >
> = {
  brands: {inputId: 'do112bBrandsH', errorId: 'do112bBrands-e'},
  orderName: {inputId: 'do112bName', errorId: 'do112bName-e'},
  description: {inputId: 'do112bDesc', errorId: 'do112bDesc-e'},
  interfaceMode: {inputId: 'do112bIf', errorId: 'do112bIfc-e'},
};

function primaryDelivery(customer: {locations?: {id: string}[]} | undefined): DraftOrderDelivery {
  return {
    locationId: customer?.locations?.[0]?.id ?? '',
    method: 'ground',
    indicator: 'sip',
    customRouting: false,
  };
}

/**
 * All of `NewDraftOrderPage`'s form/store orchestration: builder form setup,
 * products-store sync, session restore, issue navigation, and save — kept
 * out of the component so it only has to render.
 */
export function useNewDraftOrderController({
  view,
  selectedProducts,
  productError,
}: {
  view: NewDraftOrderView;
  selectedProducts: DraftProduct[];
  productError: string | null;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<SaveDraftResult>();
  const orderTypeConfig = useFetcher<OrderTypeConfig>({
    key: 'new-draft-order-type-config',
  });
  const staffMembersFetcher = useFetcher<ShopifyStaffMembersData>({
    key: 'new-draft-order-staff-members',
  });
  const overviewId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<
    keyof NewDraftOrderValues | null
  >(null);
  const [productFocus, setProductFocus] = useState<{
    productId: string;
    nonce: number;
  } | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  /** The list row this builder was opened from; shown as the existing order. */
  const [existingDraft, setExistingDraft] = useState<DraftOrderListItem | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const restoredDraft = useRef(false);
  const [draftId, setDraftId] = useState<string | null>(
    view.draftId ?? readDraftIdSession(),
  );
  const [draftDisplayId, setDraftDisplayId] = useState<string | undefined>(
    view.draftDisplayId,
  );

  const scrollToIssueField = (field: keyof NewDraftOrderValues) => {
    const targets = ISSUE_FIELD_TARGETS[field];
    if (!targets) return;

    const ids = [targets.errorId, targets.inputId].filter(
      (id): id is string => Boolean(id),
    );

    let attempts = 0;
    const maxAttempts = 5;

    const tryScroll = () => {
      for (const id of ids) {
        const node = document.getElementById(id);
        if (node) {
          node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
      }

      if (attempts >= maxAttempts) return;
      attempts += 1;
      requestAnimationFrame(tryScroll);
    };

    requestAnimationFrame(tryScroll);
  };

  useEffect(() => {
    if (view.draftId) setDraftId(view.draftId);
    if (view.draftDisplayId) setDraftDisplayId(view.draftDisplayId);
  }, [view.draftDisplayId, view.draftId]);

  const stepParam = searchParams.get(SEARCH_PARAMS.step);
  const step: DraftOrderStep = isDraftOrderStep(stepParam)
    ? stepParam
    : 'customer';
  const stepIndex = STEP_ORDER.indexOf(step);

  const defaultOrderClassification = view.orderClassifications[0]?.id ?? '';

  const form = useForm<NewDraftOrderValues>({
    resolver: zodResolver(newDraftOrderSchema),
    mode: 'onChange',
    defaultValues:
      view.initialValues
        ? {
            ...view.initialValues,
            inHandsDateManual: true,
            orderClass:
              !view.initialValues.orderType && !view.initialValues.orderClass
                ? defaultOrderClassification
                : view.initialValues.orderClass,
            artApprover: view.initialValues.artApprover || '',
            proofReader: view.initialValues.proofReader || '',
          }
        : {
        customerId: view.defaultCustomerId,
        inHandsDate: view.soonestInHands,
        inHandsDateManual: false,
        orderName: '',
        description: '',
        // Start new orders with no program code selected.
        programCode: '',
        programCode2: '',
        brands: view.availableBrands[0] ? [view.availableBrands[0]] : [],
        orderType: '',
        leadTimeMethods: [],
        leadTimeFlags: [...DEFAULT_LEAD_TIME_FLAGS],
        orderClass: defaultOrderClassification,
        interfaceMode: '',
        artApprover: '',
        proofReader: '',
        cancelDate: '',
        eventDate: '',
        eventName: '',
        billToLocationId: '',
        poNumber: '',
        shipCode: '',
        deliveries: [primaryDelivery(view.customers.find((item) => item.id === view.defaultCustomerId))],
      },
  });

  const [
    customerId,
    orderName,
    description,
    brands,
    inHandsDate,
    inHandsDateManual,
    orderType,
    orderClass,
    interfaceMode,
    leadTimeMethods,
    programCode,
    programCode2,
    leadTimeFlags,
    cancelDate,
    eventDate,
    eventName,
    billToLocationId,
    poNumber,
    shipCode,
    watchedDeliveries,
    finalArtLocked,
    quantitiesLocked,
  ] = useWatch({
    control: form.control,
    name: [
      'customerId',
      'orderName',
      'description',
      'brands',
      'inHandsDate',
      'inHandsDateManual',
      'orderType',
      'orderClass',
      'interfaceMode',
      'leadTimeMethods',
      'programCode',
      'programCode2',
      'leadTimeFlags',
      'cancelDate',
      'eventDate',
      'eventName',
      'billToLocationId',
      'poNumber',
      'shipCode',
      'deliveries',
      'finalArtLocked',
      'quantitiesLocked',
    ],
  });
  const deliveries = useMemo(() => watchedDeliveries ?? [], [watchedDeliveries]);

  // Products live in their own persisted store, so they survive the round trip
  // to "Pick from products" and back, independent of the rest of the form.
  const products = useNewDraftOrderProductsStore((state) => state.products);
  const addProducts = useNewDraftOrderProductsStore((state) => state.addProducts);
  const setProducts = useNewDraftOrderProductsStore((state) => state.setProducts);
  const totals = getDraftTotals(products, view.taxRate);
  const leadTime = orderTypeConfig.data?.leadTime ?? view.leadTimeDefaults;
  const leadTimePlan = calculateLeadTime({
    today: view.today,
    targetDate: inHandsDate || view.soonestInHands,
    timing: view.shipTiming,
    leadTime,
    selectedMethods: leadTimeMethods,
    selectedFlags: leadTimeFlags,
    orderType,
  });
  const soonestInHands = leadTimePlan.minimumInHands;
  const [leadTimeDateAdjusted, setLeadTimeDateAdjusted] = useState(false);

  // Newly picked products (from the Products page) merge into the store once per load.
  useEffect(() => {
    if (selectedProducts.length) addProducts(selectedProducts);
  }, [selectedProducts, addProducts]);

  // Keep the form's `products` field (used for validation and save) in sync with the store.
  useEffect(() => {
    form.setValue('products', products, {shouldDirty: false});
  }, [products, form]);

  useEffect(() => {
    if (!draftReady) return;
    const reconciled = reconcileInHandsDate(
      inHandsDate || view.soonestInHands,
      inHandsDateManual === true,
      soonestInHands,
    );
    if (reconciled.date !== inHandsDate) {
      form.setValue('inHandsDate', reconciled.date, {
        shouldDirty: inHandsDateManual === true,
        shouldValidate: true,
      });
    }
    if (reconciled.adjusted && inHandsDateManual === true) {
      setLeadTimeDateAdjusted(true);
    } else if (inHandsDateManual !== true || inHandsDate > soonestInHands) {
      setLeadTimeDateAdjusted(false);
    }
  }, [form, draftReady, inHandsDate, inHandsDateManual, soonestInHands, view.soonestInHands]);

  // Keep builder form state, including Step 4 shipping fields, in the persisted store.
  const setBuilderValues = useNewDraftOrderBuilderStore((state) => state.setValues);
  const resetBuilder = useNewDraftOrderBuilderStore((state) => state.reset);
  useEffect(() => {
    setBuilderValues({
      customerId,
      orderName,
      description,
      brands,
      inHandsDate,
      inHandsDateManual,
      orderType,
      orderClass,
      interfaceMode,
      leadTimeMethods,
      programCode,
      programCode2,
      leadTimeFlags,
      cancelDate,
      eventDate,
      eventName,
      billToLocationId,
      poNumber,
      shipCode,
      deliveries,
    });
  }, [
    customerId,
    orderName,
    description,
    brands,
    inHandsDate,
    inHandsDateManual,
    orderType,
    orderClass,
    interfaceMode,
    leadTimeMethods,
    programCode,
    programCode2,
    leadTimeFlags,
    cancelDate,
    eventDate,
    eventName,
    billToLocationId,
    poNumber,
    shipCode,
    deliveries,
    setBuilderValues,
  ]);

  useEffect(() => {
    if (restoredDraft.current) return;
    restoredDraft.current = true;
    const resuming = searchParams.get(SEARCH_PARAMS.resume) === FLAG_ON;
    const previousDraft = resuming ? readDraftSession() : null;
    // Opened from the list: prefill from that row unless a real draft was loaded.
    const {openedDraft, clearOpened} = useDraftOrdersListStore.getState();
    const listValues =
      openedDraft && !view.initialValues
        ? draftValuesFromListItem(openedDraft, view)
        : null;
    if (openedDraft) clearOpened();
    const listProducts = listValues && openedDraft ? draftProductsFromListItem(openedDraft) : null;
    if (listValues && openedDraft) {
      setExistingDraft(openedDraft);
      setDraftDisplayId(openedDraft.id);
      setSavedOnce(true);
    }
    const values = {
      ...form.getValues(),
      ...(previousDraft ?? {}),
      ...(listValues ?? {}),
    };
    form.reset(values);
    const {products: _omit, ...builderValues} = values;
    resetBuilder(builderValues);
    if (!resuming) {
      // The products store and the draft id are shared across every builder
      // session in this tab; a fresh "+ New draft order" (or a direct link to
      // edit a different draft) must not inherit either from the last one.
      setProducts(listProducts ?? view.initialValues?.products ?? []);
      // The reset above runs after the picks effect and would clear them; only
      // React StrictMode's second effect pass (dev) used to put them back.
      if (selectedProducts.length) addProducts(selectedProducts);
      if (!view.draftId) {
        setDraftId(null);
        setDraftDisplayId(undefined);
        writeDraftIdSession(null);
      }
    }
    setStorageError(!writeDraftSession(values));
    setDraftReady(true);
    if (!productError) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(SEARCH_PARAMS.resume, FLAG_ON);
          next.delete(SEARCH_PARAMS.productId);
          return next;
        },
        {replace: true, preventScrollReset: true},
      );
    }
  }, [form, searchParams, selectedProducts, productError, setSearchParams, setProducts, addProducts, view.draftId, view.initialValues, resetBuilder]);

  useEffect(() => {
    if (!draftReady) return;
    const subscription = form.watch(() => {
      setSavedOnce(false);
      setStorageError(!writeDraftSession(form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, draftReady]);

  function pickProducts() {
    if (!writeDraftSession(form.getValues())) {
      setStorageError(true);
      return;
    }
    const listParams = new URLSearchParams({
      [SEARCH_PARAMS.view]: PRODUCT_VIEW_GARMENT,
      [SEARCH_PARAMS.fromDraft]: FLAG_ON,
    });
    if (draftId) listParams.set(SEARCH_PARAMS.draftId, draftId);
    // Open the catalog on the order's Step 1 brands only.
    form.getValues('brands').forEach((brand) => listParams.append(SEARCH_PARAMS.brand, brand));
    void navigate(`${ROUTES.productList}?${listParams}`);
  }

  const customer = view.customers.find((item) => item.id === customerId);
  const deliveryCustomerId = useRef(customerId);
  const shipToName = deliveries[0]?.customAddress?.name
    ?? findLocation(customer?.locations ?? [], deliveries[0]?.locationId ?? '')?.name
    ?? '';
  const issues = useMemo(
    () =>
      draftOrderIssues({
        brands,
        orderName,
        description,
        orderClass,
        interfaceMode,
        products,
        finalArtLocked,
        quantitiesLocked,
      }),
    [brands, orderName, description, orderClass, interfaceMode, products, finalArtLocked, quantitiesLocked],
  );
  // Review includes unresolved issues from every step; their original step
  // remains the destination when the user chooses to fix one.
  const stepIssues = issues.filter((issue) => step === 'review' || issue.step === step);
  const [hardStop, setHardStop] = useState(false);
  // The hard stop clears as soon as the step changes or its blocking issues are resolved.
  const hardStopActive =
    hardStop && stepIssues.some((issue) => issue.severity === 'block');

  // The two locks are the Customer art + Quantity stages of the tracker.
  const workflow = useMemo(
    () =>
      view.workflow.map((stage) => {
        const locked =
          stage.code === 'customer_art'
            ? finalArtLocked
            : stage.code === 'quantity'
              ? quantitiesLocked
              : undefined;
        return locked === undefined ? stage : {...stage, state: locked ? ('passed' as const) : stage.state};
      }),
    [view.workflow, finalArtLocked, quantitiesLocked],
  );

  const saving = fetcher.state !== 'idle';
  const result = fetcher.data;
  const serverErrors = result && !result.ok ? result.errors : undefined;

  useEffect(() => {
    if (!customer) return;
    const changedCustomer = deliveryCustomerId.current !== customerId;
    deliveryCustomerId.current = customerId;
    const current = form.getValues('deliveries') ?? [];
    if (!changedCustomer) {
      const allSavedLocationsValid = current.every((delivery) =>
        !delivery.locationId || customer.locations?.some((location) => location.id === delivery.locationId),
      );
      if (allSavedLocationsValid) return;
      form.setValue('deliveries', current.map((delivery, index) =>
        delivery.locationId && !customer.locations?.some((location) => location.id === delivery.locationId)
          ? {...delivery, locationId: index === 0 ? customer.locations?.[0]?.id ?? '' : '', customAddress: undefined}
          : delivery,
      ), {shouldDirty: true});
      return;
    }
    form.setValue('deliveries', [primaryDelivery(customer)], {shouldDirty: true});
    form.setValue('billToLocationId', '', {shouldDirty: true});
  }, [customer, customerId, form]);

  const adoptedLocationsResult = useRef<SaveDraftResult | null>(null);
  useEffect(() => {
    if (fetcher.state !== 'idle' || !result) return;

    // Point drawer addresses at the Company Locations the save created, so a
    // retry or the next save does not create them again.
    if (result.createdLocations?.length && adoptedLocationsResult.current !== result) {
      adoptedLocationsResult.current = result;
      const current = form.getValues('deliveries') ?? [];
      form.setValue('deliveries', current.map((delivery, index) => {
        const created = result.createdLocations?.find((item) => item.deliveryIndex === index);
        return created && !delivery.locationId && delivery.customAddress
          ? {...delivery, locationId: created.location.id, customAddress: undefined}
          : delivery;
      }));
    }

    if (result.ok) {
      setSavedOnce(true);
      setDraftId(result.draft.orderId);
      setDraftDisplayId((current) => result.draft.displayId ?? current);
      writeDraftIdSession(result.draft.orderId);

      // State and session retain the ID for later saves and product picking.
      // Changing search params here would start another loader request after
      // the mutation, despite the editor already having the saved values.
    }
  }, [fetcher.state, result, form]);

  // Move focus to the step title on a step change, or to the field an issue points at.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (pendingFocus) {
      if (ISSUE_STEPS[pendingFocus] !== step) return;
      void form.trigger(pendingFocus).then(() => {
        form.setFocus(pendingFocus);
        scrollToIssueField(pendingFocus);
        setPendingFocus(null);
      });
      return;
    }
    titleRef.current?.focus();
  }, [step, pendingFocus, form]);

  useEffect(() => {
    if (!overviewOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOverviewOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overviewOpen]);

  const goTo = (next: DraftOrderStep) => {
    const nextIndex = STEP_ORDER.indexOf(next);
    // Quantities and card minimums are reviewed on Step 5, not navigation gates.
    setHardStop(false);
    if (step === 'customer' && nextIndex > stepIndex) {
      const customerStepFields = ['customerId', 'inHandsDate', 'orderName', 'description', 'brands'] as const;
      const navigationBlockingFields = ['customerId', 'inHandsDate', 'brands'] as const;
      void form.trigger(customerStepFields).then(() => {
        const firstInvalidField = navigationBlockingFields.find(
          (field) => form.getFieldState(field).invalid,
        );
        if (firstInvalidField) {
          form.setFocus(firstInvalidField);
          return;
        }

        setSearchParams(
          (params) => {
            params.set(SEARCH_PARAMS.step, next);
            return params;
          },
          {preventScrollReset: false},
        );
      });
      return;
    }

    setSearchParams(
      (params) => {
        params.set(SEARCH_PARAMS.step, next);
        return params;
      },
      {preventScrollReset: false},
    );
  };

  const openIssue = (issue: DraftOrderIssue) => {
    setOverviewOpen(false);
    if (issue.key === 'locks') {
      document.getElementById('do112dLocks')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }
    if (step === 'review' && issue.step === 'products') {
      // Review Fix links only change steps; do not open or focus size inputs.
      setPendingFocus(null);
      setProductFocus(null);
    } else {
      const field = ISSUE_FIELDS[issue.id];
      if (field) setPendingFocus(field);
      if (issue.id === 'lines' || issue.productId) {
        setProductFocus((current) => ({
          productId: issue.productId ?? 'empty',
          nonce: (current?.nonce ?? 0) + 1,
        }));
      }
    }
    if (issue.step !== step) {
      setSearchParams(
        (params) => {
          params.set(SEARCH_PARAMS.step, issue.step);
          return params;
        },
        {preventScrollReset: false},
      );
    }
  };

  const save = form.handleSubmit((formValues) => {
    // Who/when only exist while something is locked; blank ones stay out of the payload.
    const {lockedBy, lockedDate, ...values} = formValues;
    void fetcher.submit(
      {
        payload: JSON.stringify({
          draftId,
          values: {
            ...values,
            ...(lockedBy ? {lockedBy} : {}),
            ...(lockedDate ? {lockedDate} : {}),
          },
          // Sectioned per card, read straight from the store at the moment of save.
          lineItemProducts: buildDraftOrderLineItemProducts(
            useNewDraftOrderProductsStore.getState().products,
          ),
        }),
      },
      {method: 'post'},
    );
  }, (errors) => {
    const field = Object.keys(errors)[0] as keyof NewDraftOrderValues | undefined;
    if (!field) return;

    const issueStep = ISSUE_STEPS[field];
    if (issueStep && issueStep !== step) {
      setSearchParams(
        (params) => {
          params.set(SEARCH_PARAMS.step, issueStep);
          return params;
        },
        {preventScrollReset: false},
      );
    }
    setPendingFocus(field);
  });

  /** Locks art or quantity on the customer's behalf, records who/when, and saves. */
  const lock = (kind: 'art' | 'quantity', locked: boolean) => {
    const artLocked = kind === 'art' ? locked : Boolean(form.getValues('finalArtLocked'));
    const quantityLocked =
      kind === 'quantity' ? locked : Boolean(form.getValues('quantitiesLocked'));
    form.setValue(kind === 'art' ? 'finalArtLocked' : 'quantitiesLocked', locked, {shouldDirty: true});
    // Who/when describe the current locks, so they clear once nothing is locked.
    const anyLocked = artLocked || quantityLocked;
    form.setValue('lockedBy', anyLocked ? (customer?.rep ?? '') : '', {shouldDirty: true});
    form.setValue('lockedDate', anyLocked ? view.today : '', {shouldDirty: true});
    void save();
  };

  const submitArtProduction = () => {
    form.setValue('finalArtLocked', true, {shouldDirty: true});
    form.setValue('quantitiesLocked', true, {shouldDirty: true});
    form.setValue('lockedBy', customer?.rep ?? '', {shouldDirty: true});
    form.setValue('lockedDate', view.today, {shouldDirty: true});
    void save();
  };

  // Only New order needs the Shopify config; Reorder never loads it.
  const loadNewOrderConfig = () => {
    if (orderTypeConfig.state === 'idle' && !orderTypeConfig.data) {
      void orderTypeConfig.load(ROUTES.draftOrdersNewOrderType);
    }
  };

  const loadStaffMembers = () => {
    if (staffMembersFetcher.state === 'idle' && !staffMembersFetcher.data) {
      void staffMembersFetcher.load(ROUTES.draftOrdersNewStaff);
    }
  };

  const retryStaffMembers = () => {
    void staffMembersFetcher.load(ROUTES.draftOrdersNewStaff);
  };

  // Fetcher data does not survive a reload or the Products round trip, while
  // the restored draft keeps `orderType: 'new'` and its selected chips. Reload
  // the config so the chips render and the lead time uses live durations.
  const configMissing =
    orderType === 'new' && orderTypeConfig.state === 'idle' && !orderTypeConfig.data;
  const configRequested = useRef(false);
  useEffect(() => {
    if (!draftReady || !configMissing || configRequested.current) return;
    configRequested.current = true;
    void orderTypeConfig.load(ROUTES.draftOrdersNewOrderType);
  }, [draftReady, configMissing, orderTypeConfig]);

  const isLast = stepIndex === STEP_ORDER.length - 1;
  const nextStep = STEP_ORDER[stepIndex + 1];

  return {
    form,
    navigate,
    step,
    stepIndex,
    isLast,
    nextStep,
    goTo,
    titleRef,
    overviewId,
    overviewOpen,
    setOverviewOpen,
    products,
    totals,
    issues,
    stepIssues,
    hardStop: hardStopActive,
    openIssue,
    productFocus,
    customer,
    shipToName,
    deliveries,
    brands,
    orderName,
    description,
    orderClass,
    orderType,
    interfaceMode,
    inHandsDate,
    inHandsDateManual,
    soonestInHands,
    leadTimeDateAdjusted,
    setLeadTimeDateAdjusted,
    leadTimeMethods,
    leadTimeFlags,
    draftId,
    draftDisplayId,
    draftReady,
    storageError,
    saving,
    savedOnce,
    existingDraft,
    result,
    serverErrors,
    save,
    lock,
    submitArtProduction,
    staffMembersData: staffMembersFetcher.data,
    staffMembersLoading: staffMembersFetcher.state === 'loading',
    loadStaffMembers,
    retryStaffMembers,
    workflow,
    pickProducts,
    orderTypeConfig,
    loadNewOrderConfig,
  };
}
