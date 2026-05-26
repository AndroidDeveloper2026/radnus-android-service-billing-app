// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// Fetch all
export const fetchEngineers = createAsyncThunk(
  'admin/fetchEngineers',
  async () => {
    return await api.getEngineers();
  },
);

export const addEngineer = createAsyncThunk('admin/addEngineer', async name => {
  return await api.addEngineer(name);
});

export const deleteEngineer = createAsyncThunk(
  'admin/deleteEngineer',
  async id => {
    await api.deleteEngineer(id);
    return id;
  },
);

export const fetchMakes = createAsyncThunk('admin/fetchMakes', async () => {
  return await api.getMakes();
});

export const addMake = createAsyncThunk('admin/addMake', async name => {
  return await api.addMake(name);
});

export const deleteMake = createAsyncThunk('admin/deleteMake', async id => {
  await api.deleteMake(id);
  return id;
});

export const fetchModels = createAsyncThunk('admin/fetchModels', async () => {
  return await api.getModels();
});

export const addModel = createAsyncThunk(
  'admin/addModel',
  async ({ makeId, name }) => {
    return await api.addModel(makeId, name);
  },
);

export const deleteModel = createAsyncThunk('admin/deleteModel', async id => {
  await api.deleteModel(id);
  return id;
});

export const fetchFaults = createAsyncThunk('admin/fetchFaults', async () => {
  return await api.getFaults();
});

export const addFault = createAsyncThunk('admin/addFault', async name => {
  return await api.addFault(name);
});

export const deleteFault = createAsyncThunk('admin/deleteFault', async id => {
  await api.deleteFault(id);
  return id;
});

export const fetchDrawers = createAsyncThunk('admin/fetchDrawers', async () => {
  return await api.getDrawers();
});

export const addDrawer = createAsyncThunk('admin/addDrawer', async name => {
  return await api.addDrawer(name);
});

export const deleteDrawer = createAsyncThunk('admin/deleteDrawer', async id => {
  await api.deleteDrawer(id);
  return id;
});

export const updateEngineer = createAsyncThunk(
  'admin/updateEngineer',
  async ({ id, name }) => {
    return await api.updateEngineer(id, name);
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    engineers: [],
    makes: [],
    models: [],
    faults: [],
    drawers: [],
    loading: false,
  },
  extraReducers: builder => {
    builder
      // Engineers
      .addCase(fetchEngineers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchEngineers.fulfilled, (state, action) => {
        state.loading = false;
        state.engineers = action.payload;
      })
      .addCase(fetchEngineers.rejected, state => {
        state.loading = false;
      })
      .addCase(addEngineer.fulfilled, (state, action) => {
        state.engineers.push(action.payload);
      })
      .addCase(deleteEngineer.fulfilled, (state, action) => {
        state.engineers = state.engineers.filter(e => e.id !== action.payload);
      })
      // Makes
      .addCase(fetchMakes.pending, state => {
        state.loading = true;
      })
      .addCase(fetchMakes.fulfilled, (state, action) => {
        state.loading = false;
        state.makes = action.payload;
      })
      .addCase(fetchMakes.rejected, state => {
        state.loading = false;
      })
      .addCase(addMake.fulfilled, (state, action) => {
        state.makes.push(action.payload);
      })
      .addCase(deleteMake.fulfilled, (state, action) => {
        state.makes = state.makes.filter(m => m.id !== action.payload);
      })
      // Models
      .addCase(fetchModels.pending, state => {
        state.loading = true;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, state => {
        state.loading = false;
      })
      .addCase(addModel.fulfilled, (state, action) => {
        state.models.push(action.payload);
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter(m => m.id !== action.payload);
      })
      // Faults
      .addCase(fetchFaults.pending, state => {
        state.loading = true;
      })
      .addCase(fetchFaults.fulfilled, (state, action) => {
        state.loading = false;
        state.faults = action.payload;
      })
      .addCase(fetchFaults.rejected, state => {
        state.loading = false;
      })
      .addCase(addFault.fulfilled, (state, action) => {
        state.faults.push(action.payload);
      })
      .addCase(deleteFault.fulfilled, (state, action) => {
        state.faults = state.faults.filter(f => f.id !== action.payload);
      })
      // Drawers
      .addCase(fetchDrawers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchDrawers.fulfilled, (state, action) => {
        state.loading = false;
        state.drawers = action.payload;
      })
      .addCase(fetchDrawers.rejected, state => {
        state.loading = false;
      })
      .addCase(addDrawer.fulfilled, (state, action) => {
        state.drawers.push(action.payload);
      })
      // In extraReducers
      .addCase(updateEngineer.fulfilled, (state, action) => {
        const index = state.engineers.findIndex(
          e => e.id === action.payload.id,
        );
        if (index !== -1) state.engineers[index] = action.payload;
      })
      .addCase(deleteDrawer.fulfilled, (state, action) => {
        state.drawers = state.drawers.filter(d => d.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
