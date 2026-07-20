// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ─── Async Thunks ──────────────────────────────────────────────────────────
export const fetchEngineers = createAsyncThunk('admin/fetchEngineers', async () => {
  return await api.getEngineers();
});

export const addEngineer = createAsyncThunk('admin/addEngineer', async (name) => {
  return await api.addEngineer(name);
});

export const updateEngineer = createAsyncThunk('admin/updateEngineer', async ({ id, name }) => {
  return await api.updateEngineer(id, name);
});

export const deleteEngineer = createAsyncThunk('admin/deleteEngineer', async (id) => {
  return await api.deleteEngineer(id);
});

export const fetchMakes = createAsyncThunk('admin/fetchMakes', async () => {
  return await api.getMakes();
});

export const addMake = createAsyncThunk('admin/addMake', async (name) => {
  return await api.addMake(name);
});

export const deleteMake = createAsyncThunk('admin/deleteMake', async (id) => {
  return await api.deleteMake(id);
});

export const fetchModels = createAsyncThunk('admin/fetchModels', async () => {
  return await api.getModels();
});

export const addModel = createAsyncThunk('admin/addModel', async ({ makeId, name }) => {
  return await api.addModel(makeId, name);
});

export const deleteModel = createAsyncThunk('admin/deleteModel', async (id) => {
  return await api.deleteModel(id);
});

export const fetchDrawers = createAsyncThunk('admin/fetchDrawers', async () => {
  return await api.getDrawers();
});

export const addDrawer = createAsyncThunk('admin/addDrawer', async (name) => {
  return await api.addDrawer(name);
});

export const deleteDrawer = createAsyncThunk('admin/deleteDrawer', async (id) => {
  return await api.deleteDrawer(id);
});

export const fetchSalesReps = createAsyncThunk('admin/fetchSalesReps', async () => {
  return await api.getSalesReps();
});

export const addSalesRep = createAsyncThunk('admin/addSalesRep', async (name) => {
  return await api.addSalesRep(name);
});

export const updateSalesRep = createAsyncThunk('admin/updateSalesRep', async ({ id, name }) => {
  return await api.updateSalesRep(id, name);
});

export const deleteSalesRep = createAsyncThunk('admin/deleteSalesRep', async (id) => {
  return await api.deleteSalesRep(id);
});

// Faults
export const fetchFaults = createAsyncThunk('admin/fetchFaults', async () => {
  return await api.getFaults();
});

export const addFault = createAsyncThunk('admin/addFault', async (name) => {
  return await api.addFault(name);
});

export const deleteFault = createAsyncThunk('admin/deleteFault', async (id) => {
  return await api.deleteFault(id);
});

// Dealers
export const fetchDealers = createAsyncThunk('admin/fetchDealers', async () => {
  return await api.getDealers();
});

// ─── Slice ──────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    engineers: [],
    makes: [],
    models: [],
    drawers: [],
    salesReps: [],
    faults: [],
    dealers: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 🔥 Optimistic removal reducers
    removeMakeLocally: (state, action) => {
      state.makes = state.makes.filter(m => m.id !== action.payload);
    },
    removeModelLocally: (state, action) => {
      state.models = state.models.filter(m => m.id !== action.payload);
    },
    removeFaultLocally: (state, action) => {
      state.faults = state.faults.filter(f => f.id !== action.payload);
    },
    removeDrawerLocally: (state, action) => {
      state.drawers = state.drawers.filter(d => d.id !== action.payload);
    },
    removeEngineerLocally: (state, action) => {
      state.engineers = state.engineers.filter(e => e.id !== action.payload);
    },
    removeSalesRepLocally: (state, action) => {
      state.salesReps = state.salesReps.filter(s => s.id !== action.payload);
    },
    
    // 🔄 Rollback reducers (restore on failure)
    restoreMakeLocally: (state, action) => {
      // Avoid duplicates
      if (!state.makes.find(m => m.id === action.payload.id)) {
        state.makes.push(action.payload);
      }
    },
    restoreModelLocally: (state, action) => {
      if (!state.models.find(m => m.id === action.payload.id)) {
        state.models.push(action.payload);
      }
    },
    restoreFaultLocally: (state, action) => {
      if (!state.faults.find(f => f.id === action.payload.id)) {
        state.faults.push(action.payload);
      }
    },
    restoreDrawerLocally: (state, action) => {
      if (!state.drawers.find(d => d.id === action.payload.id)) {
        state.drawers.push(action.payload);
      }
    },
    restoreEngineerLocally: (state, action) => {
      if (!state.engineers.find(e => e.id === action.payload.id)) {
        state.engineers.push(action.payload);
      }
    },
    restoreSalesRepLocally: (state, action) => {
      if (!state.salesReps.find(s => s.id === action.payload.id)) {
        state.salesReps.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Engineers
      .addCase(fetchEngineers.pending, (state) => { state.loading = true; })
      .addCase(fetchEngineers.fulfilled, (state, action) => {
        state.loading = false;
        state.engineers = action.payload;
      })
      .addCase(fetchEngineers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addEngineer.fulfilled, (state, action) => {
        state.engineers.push(action.payload);
      })
      .addCase(updateEngineer.fulfilled, (state, action) => {
        const index = state.engineers.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.engineers[index] = action.payload;
      })
      .addCase(deleteEngineer.fulfilled, (state, action) => {
        // Already removed optimistically, but ensure it's gone
        state.engineers = state.engineers.filter(e => e.id !== action.payload.id);
      })
      .addCase(deleteEngineer.rejected, (state, action) => {
        // Error handled in component with rollback
        state.error = action.error.message;
      })
      // Makes
      .addCase(fetchMakes.fulfilled, (state, action) => {
        state.makes = action.payload;
      })
      .addCase(addMake.fulfilled, (state, action) => {
        state.makes.push(action.payload);
      })
      .addCase(deleteMake.fulfilled, (state, action) => {
        state.makes = state.makes.filter(m => m.id !== action.payload.id);
      })
      // Models
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models = action.payload;
      })
      .addCase(addModel.fulfilled, (state, action) => {
        state.models.push(action.payload);
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter(m => m.id !== action.payload.id);
      })
      // Drawers
      .addCase(fetchDrawers.fulfilled, (state, action) => {
        state.drawers = action.payload;
      })
      .addCase(addDrawer.fulfilled, (state, action) => {
        state.drawers.push(action.payload);
      })
      .addCase(deleteDrawer.fulfilled, (state, action) => {
        state.drawers = state.drawers.filter(d => d.id !== action.payload.id);
      })
      // Sales Reps
      .addCase(fetchSalesReps.fulfilled, (state, action) => {
        state.salesReps = action.payload;
      })
      .addCase(addSalesRep.fulfilled, (state, action) => {
        state.salesReps.push(action.payload);
      })
      .addCase(updateSalesRep.fulfilled, (state, action) => {
        const index = state.salesReps.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.salesReps[index] = action.payload;
      })
      .addCase(deleteSalesRep.fulfilled, (state, action) => {
        state.salesReps = state.salesReps.filter(s => s.id !== action.payload.id);
      })
      // Faults
      .addCase(fetchFaults.fulfilled, (state, action) => {
        state.faults = action.payload;
      })
      .addCase(addFault.fulfilled, (state, action) => {
        state.faults.push(action.payload);
      })
      .addCase(deleteFault.fulfilled, (state, action) => {
        state.faults = state.faults.filter(f => f.id !== action.payload.id);
      })
      // Dealers
      .addCase(fetchDealers.fulfilled, (state, action) => {
        state.dealers = action.payload;
      });
  },
});

// Export all actions
export const {
  removeMakeLocally,
  removeModelLocally,
  removeFaultLocally,
  removeDrawerLocally,
  removeEngineerLocally,
  removeSalesRepLocally,
  restoreMakeLocally,
  restoreModelLocally,
  restoreFaultLocally,
  restoreDrawerLocally,
  restoreEngineerLocally,
  restoreSalesRepLocally,
} = adminSlice.actions;

export default adminSlice.reducer;
