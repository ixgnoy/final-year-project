from supabase import create_client, Client
import config
from datetime import datetime


try:
    supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    print("Supabase client initialized.")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    supabase = None

# Cache for registered vehicles to reduce API calls
_vehicle_cache = []


def log_access_attempt(plate_number, detected_color, detected_model, plate_matched, color_matched=True):
    """
    Log an access attempt to the access_logs table in Supabase.
    """
    if not supabase:
        print("Supabase client not available. Cannot log access.")
        return False
    
    try:
        data = {
            'timestamp': datetime.now().isoformat(),
            'plate_number': plate_number,
            'detected_color': detected_color,
            'detected_model': detected_model,
            'plate_matched': plate_matched,
            'color_matched': color_matched,
        }
        
        response = supabase.table('access_logs').insert(data).execute()
        print(f"Access logged: {plate_number} (matched: {plate_matched})")
        return True
    except Exception as e:
        print(f"Error logging access: {e}")
        return False

def get_registered_vehicles():
    """Fetches all registered vehicles from Supabase and updates cache."""
    global _vehicle_cache
    if not supabase:
        print("Supabase client not available.")
        return []
    
    try:
        response = supabase.table('vehicles').select("*").execute()
        _vehicle_cache = response.data
        return _vehicle_cache
    except Exception as e:
        print(f"Error fetching vehicles: {e}")
        return []


def calculate_similarity(s1, s2):
    """
    Calculate similarity ratio between two strings.
    OCR-aware: considers commonly confused characters as matches.
    Returns a value between 0 and 1 (1 = exact match).
    """
    if not s1 or not s2:
        return 0.0
    
    s1, s2 = s1.upper(), s2.upper()
    
    if s1 == s2:
        return 1.0
    
    # OCR-similar character groups (characters that look similar)
    ocr_groups = [
        {'O', '0', 'Q', 'D'},
        {'I', '1', 'L', '|'},
        {'S', '5'},
        {'G', '6'},
        {'B', '8'},
        {'Z', '2'},
        {'M', 'W'},
        {'T', '7'},
        {'A', '4'},
        {'E', '3'},
    ]
    
    def chars_similar(c1, c2):
        """Check if two characters are OCR-similar."""
        if c1 == c2:
            return True
        for group in ocr_groups:
            if c1 in group and c2 in group:
                return True
        return False
    
    # Make strings same length for comparison
    max_len = max(len(s1), len(s2))
    min_len = min(len(s1), len(s2))
    
    # Pad shorter string
    s1_padded = s1.ljust(max_len)
    s2_padded = s2.ljust(max_len)
    
    # Count OCR-similar matches
    matches = sum(chars_similar(c1, c2) for c1, c2 in zip(s1_padded, s2_padded))
    
    # Penalize length difference slightly
    len_penalty = (max_len - min_len) * 0.2
    
    similarity = (matches - len_penalty) / max_len
    return max(0, similarity)


def get_ocr_variants(plate_text):
    """
    Generate common OCR misread variants of a plate.
    """
    variants = [plate_text]
    
    # Common OCR substitutions (both directions)
    substitutions = [
        ('M', 'W'), ('W', 'M'),
        ('O', '0'), ('0', 'O'),
        ('I', '1'), ('1', 'I'),
        ('L', '1'), ('1', 'L'),
        ('S', '5'), ('5', 'S'),
        ('Z', '2'), ('2', 'Z'),
        ('B', '8'), ('8', 'B'),
        ('G', '6'), ('6', 'G'),
        ('Q', 'O'), ('O', 'Q'),
        ('D', '0'), ('0', 'D'),
        ('T', '7'), ('7', 'T'),
        ('A', '4'), ('4', 'A'),
        ('E', '3'), ('3', 'E'),
    ]
    
    # Generate single substitutions
    for old, new in substitutions:
        if old in plate_text:
            variants.append(plate_text.replace(old, new))
    
    # Generate multiple substitutions for common patterns
    # W567O6 -> WSG706 (5->S, 6->G, O->0)
    temp = plate_text
    for old, new in [('5', 'S'), ('6', 'G'), ('7', 'T'), ('O', '0'), ('0', 'O')]:
        if old in temp:
            temp = temp.replace(old, new)
    if temp != plate_text:
        variants.append(temp)
    
    # Also try: numbers->letters in first positions, letters->numbers in last positions
    # Typical Malaysian plate: ABC1234 or AB1234C
    
    return list(set(variants))


def check_vehicle_access(plate_text, detected_color, detected_make):
    """
    Checks if the detected vehicle allows access.
    Uses fuzzy matching to handle OCR errors.
    
    Returns: (access_granted, message, color_warning)
    """
    global _vehicle_cache
    
    # Always refresh from Supabase to get latest registrations
    get_registered_vehicles()
        
    plate_text_clean = plate_text.replace(" ", "").replace("\n", "").replace("\r", "").upper()
    
    found_vehicle = None
    best_match_score = 0
    
    # Generate OCR variants to try
    plate_variants = get_ocr_variants(plate_text_clean)
    
    # 1. Find by Plate (exact match first)
    for v in _vehicle_cache:
        reg_plate = v.get('plate_number', '').replace(" ", "").upper()
        
        # Try exact match with all variants
        for variant in plate_variants:
            if reg_plate == variant:
                found_vehicle = v
                best_match_score = 1.0
                print(f"DEBUG: Exact match found: {variant} == {reg_plate}")
                break
        
        if found_vehicle:
            break
    
    # 2. If no exact match, try fuzzy matching
    if not found_vehicle:
        for v in _vehicle_cache:
            reg_plate = v.get('plate_number', '').replace(" ", "").upper()
            
            # Calculate similarity
            similarity = calculate_similarity(plate_text_clean, reg_plate)
            
            # Accept if similarity is above threshold (e.g., 80%)
            if similarity > 0.75 and similarity > best_match_score:
                found_vehicle = v
                best_match_score = similarity
                print(f"DEBUG: Fuzzy match: {plate_text_clean} ~ {reg_plate} (similarity: {similarity:.2f})")
            
    if not found_vehicle:
        return False, "Vehicle Not Registered", False
    
    print(f"DEBUG: Matched plate {plate_text_clean} to registered {found_vehicle.get('plate_number')} (score: {best_match_score:.2f})")
        
    # 3. Check Attributes (Color & Make)
    reg_color = found_vehicle.get('color', '').lower()
    reg_make = found_vehicle.get('make_model', '').lower()
    
    det_color_lower = detected_color.lower()
    det_make_lower = detected_make.lower()
    
    # Make/Model matching (must match for access)
    make_match = (det_make_lower in reg_make) or (reg_make in det_make_lower)
    
    # Color matching (mismatch only triggers warning)
    color_match = (det_color_lower in reg_color) or (reg_color in det_color_lower)
    
    if not make_match:
        # Make mismatch = DENY ACCESS
        return False, f"Make mismatch ({reg_make} vs {det_make_lower})", False
    
    # Make matches, grant access
    owner_name = found_vehicle.get('owner_name', 'Driver')
    
    # Always just return welcome message (no color warning per user request)
    return True, f"Welcome {owner_name}", False
