// components/VendorDockForm.jsx
'use client';

import { useState, useEffect } from 'react';

/* … (everything above is identical, omitted for brevity) … */

        {/* actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            /* 🔹 Add text-black so label is always readable */
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
