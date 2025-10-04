import math

# --- 1. CONSTANTES FÍSICAS E DO MODELO (MODIFICADAS) ---
# Constantes para o planeta Terra com os novos valores
H = 8000.0        # Escala de altura atmosférica (metros) - MODIFICADO
RHO_0 = 1.0       # Densidade do ar ao nível do mar (kg/m^3) - MODIFICADO
C_D = 2.0         # Coeficiente de Arrasto (adimensional) - MODIFICADO

# --- 2. DADOS DE ENTRADA DO METEORO (INALTERADO) ---
projectile_diameter = 1.01 * 1000  # Diâmetro em metros (1.01 km)
projectile_density = 2600.0        # Densidade do projétil (kg/m^3)
initial_velocity = 26.4 * 1000     # Velocidade inicial (m/s)
impact_angle_deg = 90.0            # Ângulo de impacto (graus)

# --- 3. DEFINIÇÃO DAS FÓRMULAS COMO FUNÇÕES (INALTERADO) ---

def calculate_if(Y_i, v_i, L0, rho_i, angle_deg):
    """Calcula o fator de fragmentação/sustentação I_f."""
    angle_rad = math.radians(angle_deg)
    if math.sin(angle_rad) == 0:
        return 0
    
    numerator = C_D * H * Y_i
    denominator = rho_i * L0 * v_i**2 * math.sin(angle_rad)
    
    return 4.07 * (numerator / denominator)

def calculate_z_star(Y_i, I_f, v_i):
    """Calcula a altitude de quebra z* com base em Y_i e I_f."""
    pressure_term = Y_i / (RHO_0 * v_i**2)
    
    if pressure_term <= 0:
        return float('inf')
        
    log_term = math.log(pressure_term)
    
    if_term1 = 0.3141 * I_f
    if_term2 = 1.303 * math.sqrt(max(0, 1 - I_f))
    
    inside_brackets = log_term + 1.308 - if_term1 - if_term2
    
    return -H * inside_brackets

def calculate_ram_pressure_at_altitude(z_star, v_i):
    """Calcula a pressão de impacto (Ram Pressure) em uma dada altitude."""
    rho_at_z = RHO_0 * math.exp(-z_star / H)
    ram_pressure = rho_at_z * v_i**2
    return ram_pressure

# --- 4. PROCESSO ITERATIVO PARA ENCONTRAR A SOLUÇÃO (INALTERADO) ---

def solve_breakup_altitude():
    """
    Função principal que itera para encontrar uma solução consistente
    para a altitude de quebra.
    """
    max_iterations = 10
    tolerance = 100.0
    Y_i_guess = 400000.0  # Chute inicial (0.4 MPa)

    print("Iniciando processo iterativo com os NOVOS parâmetros...\n")

    for i in range(max_iterations):
        I_f = calculate_if(Y_i_guess, initial_velocity, projectile_diameter, projectile_density, impact_angle_deg)
        z_star = calculate_z_star(Y_i_guess, I_f, initial_velocity)
        Y_i_new = calculate_ram_pressure_at_altitude(z_star, initial_velocity)
        
        print(f"Iteração {i+1}: Y_i = {Y_i_guess/1e6:.4f} MPa -> z* = {z_star/1000:.2f} km -> Y_novo = {Y_i_new/1e6:.4f} MPa")

        if abs(Y_i_new - Y_i_guess) < tolerance:
            print("\n--- Solução Convergiu! ---")
            print(f"Resistência do projétil (Y_i) estabilizada em: {Y_i_new / 1e6:.4f} MPa")
            print(f"Altitude de Quebra (z*) calculada: {z_star / 1000:.2f} km")
            return z_star, Y_i_new
        
        Y_i_guess = Y_i_new

    print("\n--- A solução não convergiu após o número máximo de iterações. ---")
    return None, None

# --- 5. EXECUTAR O CÓDIGO ---
if __name__ == "__main__":
    solve_breakup_altitude()