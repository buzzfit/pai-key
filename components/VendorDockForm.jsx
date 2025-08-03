// components/VendorDockForm.jsx
'use client';

import { useState, useEffect } from 'react';

/* … (everything above here is unchanged) … */

        {/* actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>

          {/* label always readable */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded px-4 py-2 text-black ${
              canSubmit
                ? 'bg-matrix-green hover:opacity-90'
                : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            Dock Agent
          </button>
        </div>
      </form>
    </div>
  );
}
